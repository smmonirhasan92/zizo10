const { Transaction, Wallet, User, sequelize } = require('../models');

// Methods for Payment Settings moved to settingsController.js


// Methods moved to walletController.js


// Get Pending Transactions (Admin)
exports.getPendingTransactions = async (req, res) => {
    try {
        const { type } = req.query;
        const whereClause = { status: 'pending' };
        if (type) whereClause.type = type;

        const transactions = await Transaction.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['fullName', 'phone', 'username'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get ALL Transactions (Admin History)
exports.getAllTransactions = async (req, res) => {
    try {
        const { userId } = req.query;
        const whereClause = {};
        if (userId) whereClause.userId = userId;

        const transactions = await Transaction.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['fullName', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Assign Transaction to Agent (Admin)
// Assign Transaction to Agent (Admin)
exports.assignTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { transactionId, agentId } = req.body;

        const transaction = await Transaction.findByPk(transactionId, { transaction: t });
        if (!transaction) {
            await t.rollback();
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.assignedAgentId) {
            await t.rollback();
            return res.status(400).json({ message: 'Transaction already assigned' });
        }

        transaction.assignedAgentId = agentId;
        await transaction.save({ transaction: t });

        // NOTE: Funds are NOT transferred yet. Agent must complete the task to get stock/commission.
        // This prevents agents from getting incomplete stock.

        await t.commit();
        res.json({ message: 'Transaction assigned & Funds transferred to Agent', transaction });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Assigned Transactions (Agent) - Includes Direct Deposits to Agent
exports.getAssignedTransactions = async (req, res) => {
    try {
        const agentId = req.user.user.id;
        const { Op } = require('sequelize');
        const fs = require('fs');

        try {
            fs.appendFileSync('debug.log', `\n[${new Date().toISOString()}] REQUESTING Transactions for AgentID: ${agentId}\n`);
        } catch (e) { console.error('Log Error:', e); }

        const transactions = await Transaction.findAll({
            where: {
                [Op.or]: [
                    { assignedAgentId: agentId },
                    { receivedByAgentId: agentId }
                ],
                status: 'pending'
            },
            include: [{ model: User, attributes: ['fullName', 'phone'] }],
            order: [['createdAt', 'ASC']]
        });

        try {
            fs.appendFileSync('debug.log', `[${new Date().toISOString()}] FOUND ${transactions.length} transactions for AgentID: ${agentId}\n`);
            if (transactions.length > 0) {
                fs.appendFileSync('debug.log', `[ IDs: ${transactions.map(t => t.id).join(', ')} ]\n`);
            } else {
                // Deep Debug: Check Transaction 103 specifically
                const check103 = await Transaction.findByPk(103);
                if (check103) {
                    fs.appendFileSync('debug.log', `[DEBUG 103] Found ID 103. Status: '${check103.status}' | AssignedAgent: ${check103.assignedAgentId} | ReceivedByAgent: ${check103.receivedByAgentId} | Type: ${check103.type}\n`);
                } else {
                    fs.appendFileSync('debug.log', `[DEBUG 103] Transaction 103 NOT FOUND in DB.\n`);
                }
            }
        } catch (e) { console.error('Log Error:', e); }

        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Complete Transaction (Agent/Admin)
exports.completeTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { transactionId, status, comment, bonusAmount, receivedByAgentId } = req.body;
        const agentId = req.user.user.role === 'agent' ? req.user.user.id : null;

        const transaction = await Transaction.findOne({
            where: { id: transactionId },
            include: [{ model: User, attributes: ['role', 'username'] }], // Include User to check role if needed
            transaction: t
        });

        if (!transaction) {
            await t.rollback();
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Agent Ownership Check
        if (agentId) {
            // Agents can only complete transactions assigned to them OR if they are the designated receiver
            const isAssigned = transaction.assignedAgentId === agentId;
            const isReceivedBy = transaction.receivedByAgentId === agentId;
            if (!isAssigned && !isReceivedBy) {
                await t.rollback();
                return res.status(403).json({ message: 'Transaction not assigned to you' });
            }
        }

        if (transaction.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: 'Transaction already processed' });
        }

        console.log(`Processing transaction ${transactionId} as ${status}`);

        transaction.status = status;
        transaction.adminComment = comment || 'Processed by System';

        // Admin/Agent Updates
        if (bonusAmount) transaction.bonusAmount = parseFloat(bonusAmount);

        // If an Agent ID is provided during completion (e.g., Admin selecting Agent for Add Money)
        // OR if the logged-in user is an Agent completing it, ensure we track who did it.
        if (receivedByAgentId) transaction.receivedByAgentId = receivedByAgentId;
        else if (agentId) transaction.receivedByAgentId = agentId;

        await transaction.save({ transaction: t });

        // --- HANDLING COMPLETION (APPROVED) ---
        if (status === 'completed') {

            // 1. DEPOSITS (Add Money / Recharge)
            // Logic: Credit User. If Agent used, Deduct Agent Stock.
            if (transaction.type === 'add_money' || transaction.type === 'recharge' || transaction.type === 'agent_recharge') {

                // Credit User
                const userWallet = await Wallet.findOne({ where: { userId: transaction.userId }, transaction: t });
                if (userWallet) {
                    let finalAmount = parseFloat(transaction.amount);
                    if (bonusAmount) finalAmount += parseFloat(bonusAmount);
                    userWallet.balance = parseFloat(userWallet.balance) + finalAmount;
                    await userWallet.save({ transaction: t });
                }

                // Deduct Agent Stock (If Agent is the source)
                // "receivedByAgentId" indicates the Agent who took the cash and gave the balance.
                const sourceAgentId = transaction.receivedByAgentId || (agentId ? agentId : null);

                if (sourceAgentId && transaction.type !== 'agent_recharge') {
                    // Note: agent_recharge means Agent getting stock from Admin. No Agent deduction there.

                    const agentWallet = await Wallet.findOne({ where: { userId: sourceAgentId }, transaction: t });
                    if (!agentWallet) {
                        throw new Error(`Agent Wallet not found for ID: ${sourceAgentId}`);
                    }

                    const stockToDeduct = parseFloat(transaction.amount); // The base amount user gets
                    if (parseFloat(agentWallet.balance) < stockToDeduct) {
                        throw new Error(`Insufficient Agent Stock. Available: ${agentWallet.balance}, User Requested: ${stockToDeduct}`);
                    }

                    agentWallet.balance = parseFloat(agentWallet.balance) - stockToDeduct;
                    await agentWallet.save({ transaction: t });

                    console.log(`[STOCK] Deducted ${stockToDeduct} from Agent ${sourceAgentId}`);
                }
            }

            // 2. WITHDRAWALS (Send Money / Cash Out)
            // Logic: User already deducted (on creation). Agent pays Cash. System Credits Agent Stock (Reimbursement).
            if (transaction.type === 'send_money' || transaction.type === 'cash_out' || transaction.type === 'withdraw' || transaction.type === 'mobile_recharge') {

                const processingAgentId = transaction.receivedByAgentId || transaction.assignedAgentId || (agentId ? agentId : null);

                if (processingAgentId) {
                    const agentWallet = await Wallet.findOne({ where: { userId: processingAgentId }, transaction: t });
                    if (agentWallet) {
                        // Transaction amount is usually Negative for withdrawals in DB? 
                        // Let's safely withstand both. If stored as -500, we want +500.
                        const reimbursementAmount = Math.abs(parseFloat(transaction.amount));

                        agentWallet.balance = parseFloat(agentWallet.balance) + reimbursementAmount;
                        await agentWallet.save({ transaction: t });

                        console.log(`[STOCK] Credited ${reimbursementAmount} to Agent ${processingAgentId} (Reimbursement)`);

                        // We do NOT create a separate 'admin_credit' transaction to avoid clutter, 
                        // as the original transaction now references the Agent.
                    } else {
                        throw new Error(`Agent Wallet not found for ID: ${processingAgentId}`);
                    }
                }
            }

            // 3. COMMISSION LOGIC
            const activeAgentId = transaction.receivedByAgentId || transaction.assignedAgentId;
            if (activeAgentId) {
                const agentUser = await User.findByPk(activeAgentId, { transaction: t });
                const commissionRate = parseFloat(agentUser.commissionRate || 0);

                if (commissionRate > 0) {
                    const commBase = Math.abs(parseFloat(transaction.amount));
                    const commissionAmount = (commBase * commissionRate) / 100;

                    if (commissionAmount > 0) {
                        // Credit Commission
                        await Wallet.increment('balance', {
                            by: commissionAmount,
                            where: { userId: activeAgentId },
                            transaction: t
                        });

                        // Log Commission Record
                        await Transaction.create({
                            userId: activeAgentId,
                            type: 'commission',
                            amount: commissionAmount,
                            status: 'completed',
                            recipientDetails: `Comm. for Trx #${transactionId}`,
                            description: `${commissionRate}% on ${commBase}`
                        }, { transaction: t });
                    }
                }
            }

        }

        // --- HANDLING REJECTION ---
        if (status === 'rejected') {
            // Refund User if it was a Withdrawal (Send Money)
            if (transaction.type === 'send_money' || transaction.type === 'withdraw' || transaction.type === 'cash_out' || transaction.type === 'mobile_recharge') {
                const refundAmount = Math.abs(parseFloat(transaction.amount));

                await Wallet.increment('balance', {
                    by: refundAmount,
                    where: { userId: transaction.userId },
                    transaction: t
                });
                console.log(`[REFUND] Refunded ${refundAmount} to User ${transaction.userId}`);
            }

            // Refund Agent if it was Agent Withdraw (Stock Return attempt)
            if (transaction.type === 'agent_withdraw') {
                const refundAmount = Math.abs(parseFloat(transaction.amount));
                await Wallet.increment('balance', {
                    by: refundAmount,
                    where: { userId: transaction.userId },
                    transaction: t
                });
            }
        }

        await t.commit();
        res.json({ message: 'Transaction processed successfully', status: status });

    } catch (err) {
        await t.rollback();
        console.error('Transaction Error:', err);
        // Return clear error messages for "Insufficient Funds" etc
        res.status(500).json({ message: err.message || 'Server Error Processing Transaction' });
    }
};

// Get History
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { Op } = require('sequelize');

        const whereClause = {
            [Op.or]: [
                { userId: userId },
                { assignedAgentId: userId },
                { receivedByAgentId: userId }
            ]
        };

        const transactions = await Transaction.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
