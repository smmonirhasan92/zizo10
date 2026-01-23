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

        // --- SMART PLAN CONTROL END ---

        // 0. Fetch Completed Tasks Today (Context for filtering)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const completedLogs = await TaskLog.findAll({
            where: {
                userId: user.id,
                createdAt: { [require('sequelize').Op.gte]: startOfDay }
            },
            attributes: ['taskId']
        });
        const completedSet = new Set(completedLogs.map(log => String(log.taskId)));

        // 1. Fetch Old System Ads (Filtered)
        let adTasks = await TaskAd.findAll({
            where: { status: 'active' },
            order: [['priority', 'ASC']],
            // limit: dailyLimit // Don't limit at DB query level yet, we need to filter first
        });

        // Filter out completed and Apply Limit
        adTasks = adTasks.filter(ad => !completedSet.has(String(ad.id))).slice(0, dailyLimit);

        // 2. Fetch New Smart Reviews
        let reviewTasks = await TaskProduct.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });

        // Filter out completed and Apply Limit
        reviewTasks = reviewTasks.filter(t => !completedSet.has(String(t.id))).slice(0, dailyLimit);

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
        const userId = req.user.user.id; // Correct User ID from Token
        const { taskIds, type } = req.body; // type: 'review' or 'ad' (if batch)

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'No tasks submitted' });
        }

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

        // FIX: Strict String comparison for IDs to prevent "10" !== 10 issues
        const completedTaskIds = new Set(completedToday.map(log => String(log.taskId)));
        const validTaskIds = taskIds.filter(id => !completedTaskIds.has(String(id)));

        if (validTaskIds.length === 0) {
            await t.rollback();
            // Refetch fresh balance to show to user
            const currentUser = await User.findByPk(userId);
            return res.status(200).json({ message: 'All tasks already completed today.', newBalance: currentUser.income_balance });
        }

        // Reward Logic
        let rewardPerTask = 2.00;
        if (type === 'ad') rewardPerTask = 5.00;

        const totalReward = validTaskIds.length * rewardPerTask;

        // 2. DIRECT BALANCE INJECTION (Bullet-Proof Directive #1)
        // Instead of using Wallet model, we target User.income_balance directly
        await User.increment('income_balance', {
            by: totalReward,
            where: { id: userId },
            transaction: t
        });

        // 3. TASK LOGGING (Bullet-Proof Directive #2)
        const logEntries = validTaskIds.map(tid => ({
            userId,
            taskId: String(tid), // Ensure ID is stored as String
            status: 'completed',
            reward: rewardPerTask,
            type: type || 'daily_task',
            date: new Date() // Explicit date for easier sorting
        }));

        await TaskLog.bulkCreate(logEntries, { transaction: t });

        // 4. TRANSACTION HISTORY (Bullet-Proof Directive #3)
        await require('../models').Transaction.create({
            userId,
            type: 'task_reward', // Verified ENUM value
            amount: totalReward,
            description: `Completed ${validTaskIds.length} ${type === 'ad' ? 'Ads' : 'Smart Review Tasks'}`,
            status: 'completed'
        }, { transaction: t });

        await t.commit();

        // Refetch updated user to return exact new balance
        const updatedUser = await User.findByPk(userId);

        res.json({
            message: 'Tasks Verified & Reward Added!',
            newBalance: updatedUser.income_balance,
            rewardEarned: totalReward
        });

    } catch (err) {
        await t.rollback();
        console.error("Submit Task Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


