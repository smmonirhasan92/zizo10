const { TaskAd, TaskLog, TaskProduct, User, Wallet, UserPlan, AccountTier, sequelize } = require('../models');

// Admin: Create New Task (Smart Review)
exports.createTask = async (req, res) => {
    try {
        const { type, productName, reviewText, targetPackage, adCode } = req.body;

        if (!productName || !reviewText) {
            return res.status(400).json({ message: 'Product Name and Review Text are required' });
        }

        let productImage = '';
        if (req.file) {
            productImage = `/uploads/${req.file.filename}`;
        } else {
            return res.status(400).json({ message: 'Product Image is required' });
        }

        const newTask = await TaskProduct.create({
            type,
            productName,
            productImage,
            reviewText,
            targetPackage,
            adCode: type === 'ad_integrated' ? adCode : null,
            status: 'active'
        });

        res.status(201).json({ message: 'Task Created Successfully', task: newTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Admin: Get All Tasks (Filterable)
exports.getAllTasks = async (req, res) => {
    try {
        const { type, package: targetPackage } = req.query;
        const whereClause = {};

        if (type) whereClause.type = type;
        if (targetPackage) whereClause.targetPackage = targetPackage;

        const tasks = await TaskProduct.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json({ count: tasks.length, tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get User Tasks (Combined: Ads + Reviews)
exports.getTasks = async (req, res) => {
    try {
        // FIX: Fetch REAL User Instance (req.user.user is just a JWT JSON object)
        const dbUser = await User.findByPk(req.user.user.id);

        if (!dbUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = dbUser; // Use dbUser instance for valid .save() methods

        // --- SMART PLAN CONTROL START ---
        // 1. Check if Plan is Valid
        const validPlans = ['VIP', 'Premium', 'Gold', 'Diamond'];

        let canWork = true;
        let message = '';
        let dailyLimit = 5; // Default fallback

        if (!user.account_tier || user.account_tier === 'Starter') {
            // --- SELF HEALING LOGIC ---
            // Check if user actually has an active plan in the database
            const activePlan = await UserPlan.findOne({
                where: { userId: user.id, status: 'active' },
                order: [['createdAt', 'DESC']]
            });

            if (activePlan) {
                console.log(`[Self-Healing] Fixed Tier Mismatch for ${user.username}: Starter -> ${activePlan.planName}`);
                user.account_tier = activePlan.planName;
                await user.save(); // Now this works because 'user' is a Sequelize instance
                canWork = true;
            } else {
                canWork = false;
                message = "You must purchase a VIP Plan to unlock tasks.";
            }
        }

        // 2. Fetch Plan Details (STRICT LIMIT ENFORCEMENT)
        // Get Tier Info
        let tier = await AccountTier.findOne({ where: { name: user.account_tier } });

        // Fallback for "Starter"
        if (!tier) {
            dailyLimit = 5;
        } else {
            dailyLimit = tier.daily_limit;
        }

        // Limit Strictness: "User sees ONLY what they bought"
        if (!canWork) {
            return res.json({
                canWork: false,
                message: message,
                adTasks: [],
                reviewTasks: []
            });
        }
        // --- SMART PLAN CONTROL END ---

        // 1. Fetch Old System Ads
        const adTasks = await TaskAd.findAll({
            where: { status: 'active' },
            order: [['priority', 'ASC']],
            limit: dailyLimit // STRICT LIMIT
        });

        // 2. Fetch New Smart Reviews
        const reviewTasks = await TaskProduct.findAll({
            where: { status: 'active' },
            limit: dailyLimit, // STRICT LIMIT
            order: [['createdAt', 'DESC']]
        });

        res.json({
            canWork: true,
            dailyLimit: dailyLimit,
            adTasks: adTasks,
            reviewTasks: reviewTasks
        });
    } catch (err) {
        console.error(err);
        // RETURN ERROR DETAILS TO FRONTEND FOR DEBUGGING
        res.status(500).json({ message: 'Server Error', error: err.message, stack: err.stack });
    }
};

// Alias for route compatibility
exports.getTaskStatus = exports.getTasks;

// Submit Task Set (Smart Review or Ad)
exports.submitTask = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.user.id;
        const { taskIds, type } = req.body; // type: 'review' or 'ad' (if batch)

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: 'No tasks submitted' });
        }

        const user = await User.findByPk(userId, { transaction: t });

        const { Op } = require('sequelize');

        // 1. Filter out duplicates (Anti-Cheat) - OPTIMIZED BATCH QUERY
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Fetch ALL completed tasks for this user TODAY in one go
        const completedToday = await TaskLog.findAll({
            where: {
                userId,
                taskId: { [Op.in]: taskIds }, // Check all IDs at once
                createdAt: { [Op.gte]: startOfDay }
            },
            attributes: ['taskId'], // Only fetch IDs
            transaction: t
        });

        const completedTaskIds = new Set(completedToday.map(log => log.taskId));
        const validTaskIds = taskIds.filter(id => !completedTaskIds.has(id));

        if (validTaskIds.length === 0) {
            await t.rollback();
            return res.status(200).json({ message: 'All tasks already completed today.', newBalance: (await User.findByPk(userId)).income_balance });
        }

        // Reward Logic
        let rewardPerTask = 2.00;
        if (type === 'ad') rewardPerTask = 5.00;

        const totalReward = validTaskIds.length * rewardPerTask;

        // Update Wallet
        let wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });

        // --- SELF HEALING: Create Wallet if Missing ---
        if (!wallet) {
            console.log(`[Self-Healing] Creating missing wallet for user ${userId}`);
            wallet = await Wallet.create({ userId, balance: 0.00 }, { transaction: t });
        }

        wallet.balance = parseFloat(wallet.balance) + totalReward;
        await wallet.save({ transaction: t });

        // Create TaskLogs 
        for (const tid of validTaskIds) {
            await TaskLog.create({
                userId,
                taskId: tid,
                status: 'completed',
                reward: rewardPerTask,
                type: type || 'daily_task'
            }, { transaction: t });
        }

        // Log Transaction
        await require('../models').Transaction.create({
            userId,
            type: 'task_income',
            amount: totalReward,
            description: `Completed ${validTaskIds.length} ${type === 'ad' ? 'Ads' : 'Smart Review Tasks'}`,
            status: 'completed'
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Tasks Verified & Reward Added!', newBalance: wallet.balance });

    } catch (err) {
        await t.rollback();
        console.error(err);
        // RETURN ERROR DETAILS TO FRONTEND FOR DEBUGGING
        res.status(500).json({ message: 'Server Error', error: err.message, stack: err.stack });
    }
};

