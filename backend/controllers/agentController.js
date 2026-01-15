const { User, Wallet, Transaction, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Create Agent
exports.createAgent = async (req, res) => {
    try {
        const { fullName, phone, password, commissionRate } = req.body;

        // Check availability
        let user = await User.findOne({ where: { phone } });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Generate Username
        const username = fullName.split(' ')[0].toLowerCase() + Math.floor(1000 + Math.random() * 9000);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            fullName,
            phone,
            username,
            country: 'Bangladesh', // Default for now
            password: hashedPassword,
            role: 'agent',
            commissionRate: commissionRate || 0.00,
            kycStatus: 'approved' // Agents are pre-approved by Admin
        });

        // Create Wallet
        await Wallet.create({ userId: user.id });

        res.status(201).json({ message: 'Agent created successfully', agent: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get All Agents with Performance Stats
exports.getAgents = async (req, res) => {
    try {
        const agents = await User.findAll({
            where: { role: 'agent' },
            attributes: {
                exclude: ['password'],
                include: [
                    // Total Earnings (Commission)
                    [sequelize.literal(`(
                        SELECT COALESCE(SUM(amount), 0) 
                        FROM Transactions AS t 
                        WHERE t.userId = User.id 
                        AND t.type = 'commission'
                    )`), 'totalEarnings'],

                    // Total Deposits Handled
                    [sequelize.literal(`(
                        SELECT COALESCE(SUM(amount), 0) 
                        FROM Transactions AS t 
                        WHERE t.receivedByAgentId = User.id 
                        AND (t.type = 'add_money' OR t.type = 'recharge') 
                        AND t.status = 'completed'
                    )`), 'totalDeposits'],

                    // Total Withdrawals Handled (Absolute Value)
                    [sequelize.literal(`(
                        SELECT COALESCE(SUM(ABS(amount)), 0) 
                        FROM Transactions AS t 
                        WHERE (t.receivedByAgentId = User.id OR t.assignedAgentId = User.id) 
                        AND (t.type = 'withdraw' OR t.type = 'send_money' OR t.type = 'cash_out') 
                        AND t.status = 'completed'
                    )`), 'totalWithdraws']
                ]
            },
            include: [{ model: Wallet, attributes: ['balance'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(agents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Agent Commission
exports.updateAgentCommission = async (req, res) => {
    try {
        const { agentId, commissionRate } = req.body;
        const agent = await User.findByPk(agentId);

        if (!agent) return res.status(404).json({ message: 'Agent not found' });

        agent.commissionRate = commissionRate;
        await agent.save();

        res.json({ message: 'Commission updated', agent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Verify Agent (KYC)
exports.verifyAgent = async (req, res) => {
    try {
        const { userId, status } = req.body; // status: 'approved' | 'rejected'
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.kycStatus = status;
        await user.save();

        res.json({ message: `Agent KYC ${status}`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Adjust Agent Balance (Withdraw/Deposit)
exports.adjustBalance = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { agentId, type, amount, note } = req.body; // type: 'credit' (add), 'debit' (remove)
        const agent = await User.findByPk(agentId);

        if (!agent) {
            await t.rollback();
            return res.status(404).json({ message: 'Agent not found' });
        }

        const wallet = await Wallet.findOne({ where: { userId: agentId }, transaction: t });
        if (!wallet) {
            await t.rollback();
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const adjustmentAmount = parseFloat(amount);
        if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Update Balance
        if (type === 'debit') {
            if (wallet.balance < adjustmentAmount) {
                await t.rollback();
                return res.status(400).json({ message: 'Insufficient balance' });
            }
            wallet.balance -= adjustmentAmount;
        } else if (type === 'credit') {
            wallet.balance = parseFloat(wallet.balance) + adjustmentAmount;
        } else {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid adjustment type' });
        }

        await wallet.save({ transaction: t });

        // Log Transaction
        const { Transaction } = require('../models');
        await Transaction.create({
            userId: agentId,
            type: type === 'credit' ? 'admin_credit' : 'admin_debit',
            amount: type === 'debit' ? -adjustmentAmount : adjustmentAmount,
            status: 'completed',
            adminComment: note || 'Admin Adjustment',
            recipientDetails: `Admin ${type} adjustment`
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Balance adjusted successfully', newBalance: wallet.balance });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
// Get Agent Settlement Stats (For Agent Dashboard)
exports.getSettlementStats = async (req, res) => {
    try {
        const agentId = req.user.user.id;
        // console.log('Fetching stats for Agent:', agentId);

        const agent = await User.findByPk(agentId, {
            include: [{ model: Wallet }]
        });

        if (!agent) return res.status(404).json({ message: 'Agent not found' });

        // Calculate Total Earnings
        const totalEarnings = await Transaction.sum('amount', {
            where: {
                userId: agentId,
                type: 'commission',
                status: 'completed'
            }
        }) || 0;

        // Current Stock
        let currentBalance = agent.Wallet ? parseFloat(agent.Wallet.balance) : 0.00;
        if (isNaN(currentBalance)) currentBalance = 0.00;

        res.json({
            currentBalance: currentBalance.toFixed(2),
            totalEarnings: totalEarnings,
            totalDue: 0.00
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Request Topup (Load Stock from Admin)
exports.requestTopup = async (req, res) => {
    try {
        const { amount, method, transactionId, note } = req.body;
        const agentId = req.user.user.id;

        const transaction = await Transaction.create({
            userId: agentId,
            type: 'agent_recharge',
            amount: parseFloat(amount),
            status: 'pending',
            recipientDetails: `Request Load via ${method} (TrxID: ${transactionId})`,
            description: note || 'Agent Stock Request'
        });

        res.json({ message: 'Topup request sent', transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Request Withdraw (Cash Out Stock to Admin)
exports.requestWithdraw = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, method, accountDetails } = req.body;
        const agentId = req.user.user.id;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const agentWallet = await Wallet.findOne({ where: { userId: agentId }, transaction: t });
        if (!agentWallet) {
            await t.rollback();
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (parseFloat(agentWallet.balance) < parsedAmount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Stock to Withdraw' });
        }

        // Deduct Immediately
        agentWallet.balance = parseFloat(agentWallet.balance) - parsedAmount;
        await agentWallet.save({ transaction: t });

        // Create Transaction
        const transaction = await Transaction.create({
            userId: agentId,
            type: 'agent_withdraw',
            amount: -parsedAmount, // Negative to show outflow
            status: 'pending',
            recipientDetails: `${method}: ${accountDetails}`,
            description: 'Agent Stock Withdrawal'
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Withdrawal request sent', transaction, newBalance: agentWallet.balance });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Assigned Deposits (For Agent Dashboard)
exports.getAssignedDeposits = async (req, res) => {
    try {
        const agentId = req.user.user.id;
        const { DepositRequest } = require('../models');

        const deposits = await DepositRequest.findAll({
            where: {
                assignedAgentId: agentId,
                agentStatus: 'pending' // Only pending ones
            },
            include: [{ model: User, attributes: ['fullName', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(deposits);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Process Assigned Deposit (Agent Action)
exports.processDeposit = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { requestId, action } = req.body; // action: 'approve' | 'reject'
        const agentId = req.user.user.id;
        const { DepositRequest } = require('../models');

        const deposit = await DepositRequest.findOne({
            where: { id: requestId, assignedAgentId: agentId },
            transaction: t
        });

        if (!deposit) {
            await t.rollback();
            return res.status(404).json({ message: 'Request not found or not assigned to you' });
        }

        if (deposit.agentStatus !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: 'Already processed' });
        }

        // Logic for Approval
        if (action === 'approve') {
            // Check Agent Balance
            const agentWallet = await Wallet.findOne({
                where: { userId: agentId },
                lock: t.LOCK.UPDATE, // Critical: Lock for concurrency
                transaction: t
            });

            const amount = parseFloat(deposit.amount);

            if (!agentWallet || parseFloat(agentWallet.balance) < amount) {
                await t.rollback();
                return res.status(400).json({ message: 'Insufficient Agent Balance to process deposit' });
            }

            // Deduct from Agent
            agentWallet.balance = parseFloat(agentWallet.balance) - amount;
            await agentWallet.save({ transaction: t });

            // Credit User
            const userWallet = await Wallet.findOne({ where: { userId: deposit.userId }, transaction: t });
            if (!userWallet) {
                await Wallet.create({ userId: deposit.userId, balance: amount }, { transaction: t });
            } else {
                userWallet.balance = parseFloat(userWallet.balance) + amount;
                await userWallet.save({ transaction: t });
            }

            // Update Deposit Status
            deposit.agentStatus = 'accepted';
            deposit.status = 'approved'; // Final Compassion
            await deposit.save({ transaction: t });

            // Log Transaction (Agent Debit)
            await Transaction.create({
                userId: agentId,
                type: 'agent_recharge', // Agent recharges User
                amount: -amount,
                status: 'completed',
                description: `Processed Deposit #${requestId} for User ${deposit.userId}`,
                recipientDetails: `User ID: ${deposit.userId}`
            }, { transaction: t });

            // Log Transaction (User Credit)
            await Transaction.create({
                userId: deposit.userId,
                type: 'add_money',
                amount: amount,
                status: 'completed',
                description: 'Deposit via Agent',
                receivedByAgentId: agentId
            }, { transaction: t });

        } else if (action === 'reject') {
            deposit.agentStatus = 'rejected';
            deposit.status = 'rejected'; // Final Rejection
            await deposit.save({ transaction: t });
        } else {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid Action' });
        }

        await t.commit();
        res.json({ message: `Deposit ${action}d successfully` });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
