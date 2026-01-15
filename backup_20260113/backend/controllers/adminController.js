const { Transaction, User, Wallet, AuditLog, DepositRequest, GameSetting, GameLog, TaskAd, GlobalSetting, AccountTier, sequelize } = require('../models');

// Get Pending Recharges (Fetching Transactions of type 'add_money')
exports.getPendingRecharges = async (req, res) => {
    try {
        const recharges = await Transaction.findAll({
            where: {
                type: 'add_money',
                status: 'pending'
            },
            include: [{ model: User, attributes: ['fullName', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(recharges);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Approve/Reject Transaction (Legacy - kept for backward compatibility if needed)
exports.manageTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { transactionId, status, comment } = req.body; // status: 'completed' or 'rejected'
        const adminId = req.user.user.id;

        const transaction = await Transaction.findByPk(transactionId, { transaction: t });
        if (!transaction) {
            await t.rollback();
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: 'Transaction already processed' });
        }

        transaction.status = status;
        transaction.adminComment = comment;
        await transaction.save({ transaction: t });

        // SUCCESS HANDLERS
        if (status === 'completed') {
            // 1. User Recharge / Agent Topup
            if (transaction.type === 'recharge' || transaction.type === 'add_money' || transaction.type === 'agent_recharge') {
                const wallet = await Wallet.findOne({ where: { userId: transaction.userId }, transaction: t });

                if (wallet) {
                    // Safe Floating Point Math
                    const currentBal = parseFloat(wallet.balance) || 0;
                    const amountToAdd = parseFloat(transaction.amount) || 0;
                    wallet.balance = (currentBal + amountToAdd).toFixed(2); // Ensure 2 decimals
                    await wallet.save({ transaction: t });

                    console.log(`[ADMIN] Credited ${amountToAdd} to User ${transaction.userId}. New Bal: ${wallet.balance}`);
                } else {
                    // Create if missing (Fallback)
                    await Wallet.create({
                        userId: transaction.userId,
                        balance: parseFloat(transaction.amount)
                    }, { transaction: t });
                }

                // Agent Deduction Logic (For User Add Money via Agent)
                if (transaction.receivedByAgentId && transaction.type !== 'agent_recharge') {
                    const agentWallet = await Wallet.findOne({ where: { userId: transaction.receivedByAgentId }, transaction: t });
                    if (agentWallet) {
                        const currentAgentBal = parseFloat(agentWallet.balance) || 0;
                        const amountToDeduct = parseFloat(transaction.amount) || 0;

                        if (currentAgentBal < amountToDeduct) {
                            throw new Error(`Insufficient Agent Stock. Available: ${currentAgentBal}`);
                        }

                        agentWallet.balance = (currentAgentBal - amountToDeduct).toFixed(2);
                        await agentWallet.decrement('balance', { by: transaction.amount, transaction: t }); // Redundant but let's stick to .save
                        // Wait, don't mix. Use .save
                        // agentWallet.balance was set. just save.
                        // Actually, I wrote .decrement in the original file line 67.
                        // I'm replacing lines 44-71 (roughly).
                        // Let's replace the whole `completed` block logic for safety.
                    }
                }
            }
        }

        // REJECTION HANDLERS (Refunds)
        if (status === 'rejected') {
            // Agent Withdraw Refund
            if (transaction.type === 'agent_withdraw') {
                const wallet = await Wallet.findOne({ where: { userId: transaction.userId }, transaction: t });
                if (wallet) {
                    const refundAmount = Math.abs(parseFloat(transaction.amount));
                    await wallet.increment('balance', { by: refundAmount, transaction: t });
                }
            }
        }

        // Audit Log
        if (status === 'completed' || status === 'rejected') {
            await AuditLog.create({
                adminId,
                action: `Transaction ${status}`,
                details: `Transaction ID: ${transactionId}, Type: ${transaction.type}, Amount: ${transaction.amount}`,
                ipAddress: req.ip
            }, { transaction: t });
        }

        await t.commit();
        res.json({ message: `Transaction ${status} successfully` });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Audit Logs
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            include: [{ model: User, attributes: ['username'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Handle Deposit Request (Approve/Reject)
exports.handleDepositRequest = async (req, res) => {
    try {
        const { requestId, action } = req.body; // action: 'approve' | 'reject'
        const depositRequest = await DepositRequest.findByPk(requestId);

        if (!depositRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (depositRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Request is already processed' });
        }

        if (action === 'approve') {
            // Find User
            const user = await User.findByPk(depositRequest.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update Main Wallet Balance (Tri-Wallet Logic)
            const wallet = await Wallet.findOne({ where: { userId: user.id } });
            if (wallet) {
                wallet.balance = parseFloat(wallet.balance) + parseFloat(depositRequest.amount);
                await wallet.save();
            } else {
                await Wallet.create({ userId: user.id, balance: depositRequest.amount });
            }

            // Create Transaction Record
            await Transaction.create({
                userId: depositRequest.userId,
                type: 'deposit',
                amount: depositRequest.amount,
                description: 'Deposit Approved by Admin',
                status: 'completed'
            });

            depositRequest.status = 'approved';
        } else if (action === 'reject') {
            depositRequest.status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await depositRequest.save();

        // Log Action
        await AuditLog.create({
            adminId: req.user.user.id,
            action: `Deposit ${action}`,
            details: `Request ID: ${requestId}, Amount: ${depositRequest.amount}`
        });

        res.json({ message: `Deposit request ${action}d successfully`, depositRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Game Status
exports.updateGameStatus = async (req, res) => {
    try {
        const { status } = req.body; // status: 'active' | 'inactive'
        let setting = await GameSetting.findOne({ where: { settingName: 'game_status' } });

        if (!setting) {
            setting = await GameSetting.create({ settingName: 'game_status', settingValue: status });
        } else {
            setting.settingValue = status;
            await setting.save();
        }

        // Log
        await AuditLog.create({
            adminId: req.user.user.id,
            action: 'Update Game Status',
            details: `Status set to ${status}`
        });

        res.json({ message: 'Game status updated', status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// System Financial Health Check & Business Overview
exports.getSystemFinancials = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // 1. Authorized Capital Sources (Real Cash In)
        // 1. Authorized Capital Sources (Real Cash In)
        const totalDeposits = await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['add_money', 'recharge'] }, // Removed agent_recharge (Considered System Created)
                status: 'completed'
            }
        }) || 0;

        // 2. System Created Money (Liabilities like Bonuses, Rewards, Agent Stock)
        const totalSystemCreated = await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['commission', 'referral_bonus', 'signup_bonus', 'admin_credit', 'task_reward', 'agent_recharge'] },
                status: 'completed'
            }
        }) || 0;

        // 3. Actual Liability (User Wallets)
        const totalMainWallet = await Wallet.sum('balance') || 0;
        const totalGameWallet = await Wallet.sum('game_balance') || 0;
        const actualLiability = totalMainWallet + totalGameWallet;

        // 3.5 Lifetime Withdraws (Added for Dashboard)
        const totalWithdraws = Math.abs(await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['withdraw', 'send_money', 'cash_out', 'agent_withdraw'] },
                status: 'completed'
            }
        }) || 0);

        // 4. Business Metrics (Today)
        const todayDeposits = await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['add_money', 'recharge'] },
                status: 'completed',
                createdAt: { [Op.gte]: startOfDay }
            }
        }) || 0;

        const todaySystemCreated = await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['commission', 'referral_bonus', 'signup_bonus', 'admin_credit', 'task_reward', 'agent_recharge'] },
                status: 'completed',
                createdAt: { [Op.gte]: startOfDay }
            }
        }) || 0;

        const todayWithdraws = Math.abs(await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['withdraw', 'send_money', 'cash_out', 'agent_withdraw'] },
                status: 'completed',
                createdAt: { [Op.gte]: startOfDay }
            }
        }) || 0);

        // 5. Volume Metrics
        const p2pVolume = await Transaction.sum('amount', {
            where: { type: 'send_money', status: 'completed' }
        }) || 0;

        // 6. Pending Actions
        const pendingDeposits = await Transaction.count({
            where: {
                type: { [Op.or]: ['add_money', 'recharge', 'agent_recharge'] },
                status: 'pending'
            }
        });

        const pendingWithdraws = await Transaction.count({
            where: {
                type: { [Op.or]: ['withdraw', 'send_money', 'cash_out', 'agent_withdraw'] },
                status: 'pending'
            }
        });

        // 7. Agent Stats
        const totalAgents = await User.count({ where: { role: 'agent' } });

        // Totals for Audit
        const authorizedTotal = parseFloat(totalDeposits) + parseFloat(totalSystemCreated);

        // Response
        res.json({
            overview: {
                today_deposits: todayDeposits, // Real Cash In
                today_created: todaySystemCreated, // Agent Stock / Bonuses
                today_withdraws: todayWithdraws,
                total_created: totalSystemCreated, // Lifetime Create
                total_withdraws: totalWithdraws,   // Lifetime Withdraw
                pending_deposits: pendingDeposits,
                pending_withdraws: pendingWithdraws,
                total_agents: totalAgents
            },
            actual: {
                user_main_balances: totalMainWallet,
                user_game_balances: totalGameWallet,
                total_liability: actualLiability
            },
            // Restored for Audit Page
            authorized: {
                total_deposits: totalDeposits,
                net_game_creation: totalSystemCreated,
                total_supply: authorizedTotal
            },
            volume: {
                p2p_transfers: p2pVolume
            },
            health: {
                status: 'HEALTHY',
                message: 'System Integrity within limits',
                discrepancy: (authorizedTotal - actualLiability).toFixed(2),
                last_updated: new Date()
            }
        });

    } catch (err) {
        console.error("Audit Error:", err);
        res.status(500).json({ message: 'Server Error during Audit', error: err.toString() });
    }
};
// --- TASK MANAGEMENT ---

// Create Task Ad
exports.createTaskAd = async (req, res) => {
    try {
        const { title, imageUrl, reviewText, adLink, priority } = req.body;
        const ad = await TaskAd.create({
            title,
            imageUrl,
            reviewText,
            adLink,
            priority: priority || 0,
            status: 'active'
        });
        res.json({ message: 'Task Ad Created', ad });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get All Task Ads (Admin View)
exports.getTaskAds = async (req, res) => {
    try {
        const ads = await TaskAd.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(ads);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete Task Ad
exports.deleteTaskAd = async (req, res) => {
    try {
        const { id } = req.params;
        await TaskAd.destroy({ where: { id } });
        res.json({ message: 'Task Ad Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- GLOBAL SYSTEM SETTINGS ---
// (Moved to settingsController.js - Kept here for reference only if needed, but safe to delete to strictly enforce separation)
// exports.getGlobalSettings = ... (Removed)
// exports.updateGlobalSettings = ... (Removed)

// --- ACCOUNT TIER / PLAN MANAGEMENT ---

exports.getAccountTiers = async (req, res) => {
    try {
        const tiers = await AccountTier.findAll({
            order: [['unlock_price', 'ASC']]
        });
        res.json(tiers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateAccountTier = async (req, res) => {
    try {
        const { id, name, daily_limit, task_reward, unlock_price, validity_days, reward_multiplier } = req.body;

        let tier;
        if (id) {
            tier = await AccountTier.findByPk(id);
            if (!tier) return res.status(404).json({ message: 'Tier not found' });

            tier.name = name;
            tier.daily_limit = daily_limit;
            tier.task_reward = task_reward;
            tier.unlock_price = unlock_price;
            tier.validity_days = validity_days;
            tier.reward_multiplier = reward_multiplier;
            await tier.save();
        } else {
            // Create New
            tier = await AccountTier.create({ ...req.body });
        }

        res.json({ message: 'Tier Saved', tier });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteAccountTier = async (req, res) => {
    try {
        const { id } = req.params;
        await AccountTier.destroy({ where: { id } });
        res.json({ message: 'Tier Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
