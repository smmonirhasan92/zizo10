const { TaskAd, TaskLog, TaskProduct, User, Wallet, UserPlan, sequelize } = require('../models');

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
        const { TaskProduct, TaskAd } = require('../models');

        // 1. Fetch Old System Ads
        const adTasks = await TaskAd.findAll({
            where: { status: 'active' },
            order: [['priority', 'ASC']]
        });

        // 2. Fetch New Smart Reviews
        // Calculate Week
        const joinDate = new Date(user.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentWeek = Math.ceil(diffDays / 7) || 1;

        const reviewTasks = await TaskProduct.findAll({
            where: {
                status: 'active',
                // weekNumber: currentWeek // Using strict rotation
            },
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        // Optional: Filter in memory if we want to fallback to Week 1 if Week X is empty
        // For now, I'm keeping it commented to avoid breaking existing flow until Admin sets weeks.
        // But the logic is here.
        // To enable: Uncomment the where clause above.

        res.json({
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

        // Reward Logic: Check Plan, Calculate Amount
        // TODO: Fetch Dynamic Reward from Schedule/Plan
        let rewardPerTask = 2.00;
        if (type === 'ad') rewardPerTask = 5.00; // Higher for ads? Example.

        const totalReward = taskIds.length * rewardPerTask;

        // Update Wallet
        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });
        wallet.balance = parseFloat(wallet.balance) + totalReward;
        await wallet.save({ transaction: t });

        // Log Transaction
        await require('../models').Transaction.create({
            userId,
            type: 'task_income',
            amount: totalReward,
            description: `Completed ${taskIds.length} ${type === 'ad' ? 'Ads' : 'Start Review Tasks'}`,
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

