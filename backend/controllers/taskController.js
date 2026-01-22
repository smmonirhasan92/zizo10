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
        const user = req.user.user;

        // --- SMART PLAN CONTROL START ---
        // 1. Check if Plan is Valid
        const validPlans = ['VIP', 'Premium', 'Gold', 'Diamond']; // Add all valid paid plans here
        // If user is 'Starter' or 'Free', they cannot work (unless we allow free tasks?)
        // Requirement: "User cannot work without plan"
        // Let's assume 'Starter' is the default/no-plan state.

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
                await user.save(); // Persist the fix
                canWork = true;
            } else {
                canWork = false;
                message = "You must purchase a VIP Plan to unlock tasks.";
            }
        }

        // 2. Fetch Plan Details (STRICT LIMIT ENFORCEMENT)
        // Get Tier Info
        let tier = await AccountTier.findOne({ where: { name: user.account_tier } });

        // Fallback for "Starter" or defined limits
        if (!tier) {
            // If strictly Starter = 0 limits? Or 5 free? 
            // Agent Directive says "Package Level Lock", so Starter = 0 or Locked.
            // But we already handled "canWork" above.
            // Let's assume if canWork is true, there's a limit.
            dailyLimit = 5;
        } else {
            dailyLimit = tier.daily_limit;
        }

        // Limit Strictness: "User sees ONLY what they bought"
        // If limit is 20, we fetch 20.

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
        // Calculate Week
        const joinDate = new Date(user.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentWeek = Math.ceil(diffDays / 7) || 1;

        // Calculate remaining slots if we want mixed? Or just separate limits?
        // Usually "Daily Limit" is total tasks.
        // Let's apply limit to both for safety or split?
        // Directive: "1000 TK = 20 Tasks".
        // Let's assuming "Review Tasks" are the main work.

        const reviewTasks = await TaskProduct.findAll({
            where: {
                status: 'active',
                // weekNumber: currentWeek // DISABLED: Strict rotation disabled based on Agent Analysis to ensure tasks show up.
            },
            limit: dailyLimit, // STRICT LIMIT
            order: [['createdAt', 'DESC']]
        });

        // Optional: Filter in memory if we want to fallback to Week 1 if Week X is empty
        // For now, I'm keeping it commented to avoid breaking existing flow until Admin sets weeks.
        // But the logic is here.
        // To enable: Uncomment the where clause above.

        res.json({
            canWork: true, // Explicitly send true
            dailyLimit: dailyLimit, // Send limit for frontend UI
            adTasks: adTasks,
            reviewTasks: reviewTasks
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
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
            // Return 200 to avoid frontend error, just no reward.
            // Actually, let's just return current balance.
            // Need to fetch wallet balance to be safe or just return 0 diff.
        }

        // Reward Logic: Check Plan, Calculate Amount
        // TODO: Fetch Dynamic Reward from Schedule/Plan
        let rewardPerTask = 2.00;
        if (type === 'ad') rewardPerTask = 5.00; // Higher for ads? Example.

        const totalReward = validTaskIds.length * rewardPerTask;

        // Update Wallet
        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });
        wallet.balance = parseFloat(wallet.balance) + totalReward;
        await wallet.save({ transaction: t });

        // Create TaskLogs (Critical for History & Anti-Cheat)
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
            description: `Completed ${validTaskIds.length} ${type === 'ad' ? 'Ads' : 'Start Review Tasks'}`,
            status: 'completed'
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Tasks Verified & Reward Added!', newBalance: wallet.balance });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

