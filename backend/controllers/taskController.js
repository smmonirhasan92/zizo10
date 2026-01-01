const { User, Transaction, GlobalSetting, TaskLog, TaskAd, AccountTier, UserPlan, sequelize } = require('../models');
const { Op } = require('sequelize');

// Safety Cap for Rewards (Anti-Fraud)
const MAX_REWARD_PER_TASK = 500.00;

exports.getTaskStatus = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const today = new Date().toISOString().split('T')[0];

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch All Active Plans
        const activePlans = await UserPlan.findAll({
            where: {
                userId,
                status: 'active'
            }
        });

        // Resolve Detailed Plans with current tier info
        let totalDailyLimit = 0;
        let totalCompleted = 0;
        let currentReward = 0;
        let currentMultiplier = 1;
        let activePlanName = 'None';
        let planDetails = [];

        // If no active plans, check if User is 'Starter' (Legacy/Free logic)
        // If we want to treat 'Starter' as a plan, we need a UserPlan for it, 
        // OR we handle the fallback here. 
        // Logic: If activePlans empty, try to get AccountTier based on user.account_tier
        if (activePlans.length === 0) {
            const tierName = user.account_tier || 'Starter';
            const tier = await AccountTier.findOne({ where: { name: tierName } });

            // Should we create a UserPlan on the fly? 
            // Better to show "0 limit" or "Buy a plan".
            // Legacy support: If 'Starter' is allowed, we might want to allow it.
            // But Strict Multi-Plan usually means "No Plan = No Work".
            // Let's assume for now: No Plan = Limit 0.

            // However, to avoid breaking existing "Starter" users who haven't migrated yet:
            // If the migration script hasn't run, they might be stuck.
            // We will assume migration runs. But as fallback:
            if (tierName === 'Starter') {
                // Allow Starter logic? 
                // Let's stick to strict: activePlans required.
                // But we can fallback to user.account_tier IF it matches 'Starter' and give it low limits.
                const effectiveTier = tier || { daily_limit: 0, task_reward: 0 };
                totalDailyLimit = effectiveTier.daily_limit;
                totalCompleted = user.tasks_completed_today; // Global counter
                currentReward = effectiveTier.task_reward;
                activePlanName = tierName;
            }
        } else {
            // Aggregate from Plans
            for (const plan of activePlans) {
                // Reset Check
                if (plan.last_task_date !== today) {
                    plan.tasks_completed_today = 0;
                    // We don't save here to avoid side effects in GET, but we use corrected values
                }

                const tier = await AccountTier.findOne({ where: { name: plan.planName } });
                const limit = tier ? tier.daily_limit : 0;
                const reward = tier ? parseFloat(tier.task_reward) : 0;

                totalDailyLimit += limit;
                totalCompleted += plan.tasks_completed_today;

                planDetails.push({
                    name: plan.planName,
                    completed: plan.tasks_completed_today,
                    limit: limit,
                    reward: reward
                });

                // Set Current Working Plan (First one with quota)
                if (plan.tasks_completed_today < limit && currentReward === 0) {
                    currentReward = reward;
                    activePlanName = plan.planName;
                    // multiplier not strictly needed if we use fixed reward
                }
            }
        }

        // Global Settings Base (Fallback)
        const globalSettings = await GlobalSetting.findOne();
        const baseReward = globalSettings ? parseFloat(globalSettings.task_base_reward) : 5.00;

        let finalDisplayReward = currentReward > 0 ? currentReward : baseReward; // Fallback display

        const canWork = totalCompleted < totalDailyLimit;
        const tasksRemaining = Math.max(0, totalDailyLimit - totalCompleted);

        // Fetch Ads
        // We limit ads to the Total Limit for efficiency
        const taskAds = await TaskAd.findAll({
            where: { status: 'active' },
            limit: totalDailyLimit > 0 ? totalDailyLimit : 10,
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json({
            tasksCompleted: totalCompleted,
            dailyLimit: totalDailyLimit,
            rewardPerTask: finalDisplayReward.toFixed(2),
            taskAds: taskAds,
            tierName: activePlanName, // Current active plan
            canWork: canWork,
            tasksRemaining: tasksRemaining,
            plans: planDetails, // UI can show "Plan A: 5/10"
            message: canWork ? `Working on ${activePlanName}` : 'All daily tasks completed.'
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
        const today = new Date().toISOString().split('T')[0];

        const user = await User.findByPk(userId, { transaction: t }); // Lock user row?
        // SQLite/MySQL lock support varies. 'lock: true' is standard.
        // For safe updates, we rely on the Transaction + Logic.

        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch All Active Plans (with Lock if possible, but Transaction is key)
        const activePlans = await UserPlan.findAll({
            where: { userId, status: 'active' },
            transaction: t,
            lock: true // Pessimistic locking to prevent race conditions
        });

        let targetPlan = null;
        let rewardToGive = 0;

        // Fallback for Legacy/Starter if no plans
        if (activePlans.length === 0) {
            // If user is Starter, handle legacy?
            // STRICT MODE: Fail if no plan.
            // "Please buy a plan".
            // Check if user is theoretically 'Starter'
            if (user.account_tier === 'Starter') {
                // Handle legacy Starter... (Omitted for brevity/strictness, but let's assume Migration ran)
                // If Migration runs, Starter should have a Plan entry if we want them to work.
                // If not, we return error.
                await t.rollback();
                return res.status(400).json({ message: 'No active plan found. Please upgrade.' });
            }
        }

        // Iterate to find the first plan with quota
        for (const plan of activePlans) {
            // Reset logic inside Transaction
            if (plan.last_task_date !== today) {
                plan.tasks_completed_today = 0;
                plan.last_task_date = today;
                await plan.save({ transaction: t }); // Persist reset immediately
            }

            const tier = await AccountTier.findOne({ where: { name: plan.planName }, transaction: t });
            if (!tier) continue; // Should not happen

            const limit = tier.daily_limit;

            if (plan.tasks_completed_today < limit) {
                targetPlan = plan;
                rewardToGive = parseFloat(tier.task_reward);
                break; // Found our plan!
            }
        }

        if (!targetPlan) {
            await t.rollback();
            return res.status(400).json({ message: 'Daily limit reached for all active plans.' });
        }

        // SAFETY: Max Reward Cap
        if (rewardToGive > MAX_REWARD_PER_TASK) {
            console.error(`[SECURITY] User ${userId} attempted to earn ${rewardToGive} which exceeds cap!`);
            await t.rollback();
            return res.status(400).json({ message: 'Security Alert: Reward calculation abnormal.' });
        }

        // Sanity Check: Reward must be positive
        if (rewardToGive <= 0) {
            // Maybe global fallback?
            // No, strict plan logic.
            rewardToGive = 0; // Or error?
        }

        // Execute Update
        targetPlan.tasks_completed_today += 1;
        await targetPlan.save({ transaction: t });

        // Update User Balance
        const currentBal = parseFloat(user.income_balance);
        const newBal = (currentBal + rewardToGive).toFixed(2); // String to prevent float drift

        user.income_balance = newBal;

        // Update user global stats
        if (user.last_task_date !== today) {
            user.last_task_date = today;
            user.tasks_completed_today = 0;
        }
        user.tasks_completed_today += 1;

        await user.save({ transaction: t });

        // Logs
        await TaskLog.create({
            userId: user.id,
            date: today,
            amount_earned: rewardToGive
            // details field removed as it doesn't exist in model
        }, { transaction: t });

        await Transaction.create({
            userId: user.id,
            type: 'task_reward',
            amount: rewardToGive,
            description: `Task Reward - ${targetPlan.planName}`,
            status: 'completed'
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Task Completed',
            newBalance: user.income_balance,
            tasksCompleted: user.tasks_completed_today, // Global
            rewardEarned: rewardToGive,
            planName: targetPlan.planName
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
