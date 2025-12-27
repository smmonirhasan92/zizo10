const { User, Transaction, GlobalSetting, TaskLog, TaskAd, AccountTier, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getTaskStatus = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Tier Logic - STRICT
        // Default to 'Starter' (Free) if no tier, but ensure we fetch the actual tier object
        const tierName = user.account_tier || 'Starter';
        const tier = await AccountTier.findOne({ where: { name: tierName } });

        // Safety Fallback: If for some reason tier doesn't exist in DB (integrity error), use a safe default
        // But for "Strict Plan-Based Logic" we should rely on the DB.
        const effectiveTier = tier || { daily_limit: 0, reward_multiplier: 1.00, task_reward: 0 };

        // Global Settings (Used for Base Reward)
        const globalSettings = await GlobalSetting.findOne();
        const baseReward = globalSettings ? parseFloat(globalSettings.task_base_reward) : 5.00;

        // Calculate Dynamic Reward
        // Priority: Plan-specific reward (if set > 0) -> Global Base * Plan Multiplier
        // The implementation plan suggests using the Multiplier logic.
        // If effectiveTier.task_reward is explicit (e.g. 50), we might want to use that?
        // Let's stick to the multiplier logic as requested in the plan updates.
        // effectiveTier.task_reward is often the display value. 
        // Let's use: Base * Multiplier
        const multiplier = parseFloat(effectiveTier.reward_multiplier) || 1.00;
        const finalReward = (baseReward * multiplier).toFixed(2);

        // STRICT LIMIT ENFORCEMENT
        // Use the Tier's limit. If the user is on a plan, they get THAT limit.
        const dailyLimit = parseInt(effectiveTier.daily_limit) || 0;

        const settings = {
            task_base_reward: finalReward,
            daily_task_limit: dailyLimit
        };

        // Daily Reset Logic
        const today = new Date().toISOString().split('T')[0];
        if (user.last_task_date !== today) {
            user.last_task_date = today;
            user.tasks_completed_today = 0;
            await user.save();
        }

        // Fetch Active Task Ads - STRICT LIMIT
        // The limit MUST be the user's daily limit.
        // If they have completed 2, and limit is 5, we still show them the pool?
        // Usually, we show them `dailyLimit` number of tasks.
        // Or do we show `dailyLimit - completed`? 
        // User request: "User sees ONLY the specific number of tasks assigned to that plan."
        // If Plan = 5 tasks. We query `limit: 5`.
        const taskAds = await TaskAd.findAll({
            where: { status: 'active' },
            limit: settings.daily_task_limit, // STRICT LIMIT HERE
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });

        // Valid Tiers Check
        // If daily_limit is 0, they can't work.
        const canWork = settings.daily_task_limit > 0;

        res.json({
            tasksCompleted: user.tasks_completed_today,
            dailyLimit: settings.daily_task_limit,
            rewardPerTask: settings.task_base_reward,
            taskAds: taskAds,
            tierName: tierName,
            multiplier: multiplier,
            canWork: canWork,
            message: canWork ? 'Keep working!' : 'Please upgrade your plan to unlock tasks.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.submitTask = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.user.id;
        const user = await User.findByPk(userId, { transaction: t });

        // Tier Logic
        await AccountTier.findOne({ where: { name: 'Starter' }, transaction: t });

        // BLOCK FREE USERS (Starter)
        if (!user.account_tier || user.account_tier === 'Starter' || user.account_tier === 'Free') {
            await t.rollback();
            return res.status(403).json({ message: 'Free plan cannot perform tasks. Please upgrade.' });
        }

        // Global Settings
        const globalSettings = await GlobalSetting.findOne({ transaction: t });
        const baseReward = globalSettings ? parseFloat(globalSettings.task_base_reward) : 5.00;
        const globalDailyLimit = globalSettings ? globalSettings.daily_task_limit : 10;

        // Calculate Dynamic Reward
        const multiplier = tier ? parseFloat(tier.reward_multiplier) : 1.00;
        const finalReward = parseFloat((baseReward * multiplier).toFixed(2));

        // Limit Logic
        const dailyLimit = (tier && tier.daily_limit > 0) ? tier.daily_limit : globalDailyLimit;

        const settings = {
            task_base_reward: finalReward,
            daily_task_limit: dailyLimit
        };

        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // Daily Reset Check (Security)
        const today = new Date().toISOString().split('T')[0];
        if (user.last_task_date !== today) {
            user.last_task_date = today;
            user.tasks_completed_today = 0;
            // Don't save yet, we save at end
        }

        // Limit Check
        if (user.tasks_completed_today >= settings.daily_task_limit) {
            await t.rollback();
            return res.status(400).json({ message: 'Daily task limit reached' });
        }

        // Update User
        user.tasks_completed_today += 1;

        // Update Income Wallet
        // Ensure income_balance is treated as number
        user.income_balance = parseFloat(user.income_balance) + settings.task_base_reward;

        await user.save({ transaction: t });

        // Log Task
        await TaskLog.create({
            userId: user.id,
            date: today,
            amount_earned: settings.task_base_reward
        }, { transaction: t });

        // Create Transaction Record (So User sees it in History)
        await Transaction.create({
            userId: user.id,
            type: 'task_reward',
            amount: settings.task_base_reward,
            description: `Task Reward`,
            status: 'completed'
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Task Completed',
            newBalance: user.income_balance,
            tasksCompleted: user.tasks_completed_today,
            rewardEarned: settings.task_base_reward
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
