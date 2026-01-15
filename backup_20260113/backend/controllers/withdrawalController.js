const { Transaction, User, Wallet, sequelize } = require('../models');

// Request Withdrawal (User)
exports.requestWithdrawal = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, method, accountDetails, walletType } = req.body; // walletType: 'main' or 'income'
        const userId = req.user.user.id;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findByPk(userId, { include: [{ model: Wallet }], transaction: t });

        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // Balance Check & Deduction
        if (walletType === 'income') {
            if (parseFloat(user.income_balance) < parsedAmount) {
                await t.rollback();
                return res.status(400).json({ message: 'Insufficient Income Balance' });
            }
            user.income_balance = parseFloat(user.income_balance) - parsedAmount;
            await user.save({ transaction: t });
        } else {
            // Default to Main Wallet
            if (!user.Wallet || parseFloat(user.Wallet.balance) < parsedAmount) {
                await t.rollback();
                return res.status(400).json({ message: 'Insufficient Main Wallet Balance' });
            }
            user.Wallet.balance = parseFloat(user.Wallet.balance) - parsedAmount;
            await user.Wallet.save({ transaction: t });
        }

        // Create Transaction
        const transaction = await Transaction.create({
            userId,
            type: 'cash_out',
            amount: -parsedAmount, // Negative to show deduction in history? Or Positive with type 'withdraw'? 
            // Standard: Withdrawals are negative in history sums, but let's keep it consistent.
            // If p2p_transfer uses negative, we use negative.
            status: 'pending',
            recipientDetails: `${method} - ${accountDetails} (${walletType} wallet)`,
            description: `Withdrawal Request from ${walletType} wallet`
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Withdrawal requested successfully', transaction });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Withdrawals (Admin)
exports.getWithdrawals = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = { type: 'cash_out' };
        if (status) whereClause.status = status;

        const withdrawals = await Transaction.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['fullName', 'phone', 'username'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(withdrawals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Process Withdrawal (Admin: Approve/Reject)
exports.processWithdrawal = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { transactionId, status, adminComment, agentId } = req.body; // agentId is optional (if admin assigns specific agent to pay)
        // status: 'completed' or 'rejected'

        const transaction = await Transaction.findByPk(transactionId, { transaction: t });
        if (!transaction || transaction.type !== 'cash_out') {
            await t.rollback();
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        if (transaction.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: 'Request already processed' });
        }

        transaction.status = status;
        transaction.adminComment = adminComment;

        // Assign Agent if provided
        if (agentId) {
            transaction.assignedAgentId = agentId;
        }

        await transaction.save({ transaction: t });

        // CASE 1: REJECTED -> Refund the User
        if (status === 'rejected') {
            const user = await User.findByPk(transaction.userId, { include: [{ model: Wallet }], transaction: t });
            const refundAmount = Math.abs(parseFloat(transaction.amount));

            // Determine wallet type (Income vs Main)
            const isIncome = transaction.description && transaction.description.includes('income wallet');

            if (isIncome) {
                user.income_balance = parseFloat(user.income_balance) + refundAmount;
                await user.save({ transaction: t });
            } else {
                if (user.Wallet) {
                    user.Wallet.balance = parseFloat(user.Wallet.balance) + refundAmount;
                    await user.Wallet.save({ transaction: t });
                }
            }
        }

        // CASE 2: COMPLETED -> Reimburse the Agent + Commission
        else if (status === 'completed') {
            const processingAgentId = agentId || transaction.assignedAgentId;

            if (processingAgentId) {
                const agent = await User.findByPk(processingAgentId, { transaction: t });
                const agentWallet = await Wallet.findOne({ where: { userId: processingAgentId }, transaction: t });

                if (!agent || !agentWallet) {
                    await t.rollback();
                    return res.status(404).json({ message: 'Assigned Agent or Agent Wallet not found. Cannot Process.' });
                }

                const reimbursementAmount = Math.abs(parseFloat(transaction.amount));

                // fetch settings
                const { GlobalSetting } = require('../models');
                const settings = await GlobalSetting.findOne({ transaction: t });
                const commissionPercent = settings ? parseFloat(settings.cash_out_commission_percent) : 0;
                const commissionAmount = reimbursementAmount * (commissionPercent / 100);

                const totalCredit = reimbursementAmount + commissionAmount;

                // Credit Agent Stock (Principal + Commission)
                agentWallet.balance = (parseFloat(agentWallet.balance) + totalCredit).toFixed(2);
                await agentWallet.save({ transaction: t });

                // Log Reimbursement (Principal)
                await Transaction.create({
                    userId: processingAgentId,
                    type: 'admin_credit',
                    amount: reimbursementAmount,
                    status: 'completed',
                    description: `Reimbursement for Cash-Out TrxID: ${transactionId}`,
                    recipientDetails: `User: ${transaction.userId} Cash Out`,
                    relatedUserId: transaction.userId
                }, { transaction: t });

                // Log Commission (Profit)
                if (commissionAmount > 0) {
                    await Transaction.create({
                        userId: processingAgentId,
                        type: 'commission',
                        amount: commissionAmount.toFixed(2),
                        status: 'completed',
                        description: `Commission (${commissionPercent}%) for Cash-Out TrxID: ${transactionId}`,
                        recipientDetails: `System Bonus`,
                        relatedUserId: transaction.userId
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        res.json({ message: `Withdrawal ${status}` });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
