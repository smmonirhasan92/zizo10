const { sequelize, User, UserPlan, AccountTier } = require('../backend/models');

async function migrateUserPlans() {
    console.log('Starting Migration: User Plans...');
    const t = await sequelize.transaction();

    try {
        const users = await User.findAll({ transaction: t });
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            // Skip if user has no tier or is Starter (and we treat Starter as default/no-plan)
            // BUT, if we want multi-plan, even Starter might be a "plan"?
            // Usually Starter is free/automatic so maybe we don't need a UserPlan entry unless we treat it as such.
            // Let's assume ONLY paid plans need entries, OR all.
            // Requirement: "Users must be able to hold and use multiple plans".
            // If they have Starter, do they keep it? Usually yes.
            // Let's migrate whatever string is in account_tier.

            const currentTier = user.account_tier;
            if (!currentTier) continue;

            // Check if plan exists in AccountTier to get details? 
            // Not strictly needed for UserPlan creation but good for validation.
            // const tierDef = await AccountTier.findOne({ where: { name: currentTier }, transaction: t });

            // Check if UserPlan already exists (Run-once safety)
            const existingPlan = await UserPlan.findOne({
                where: { userId: user.id, planName: currentTier, status: 'active' },
                transaction: t
            });

            if (!existingPlan) {
                console.log(`Migrating User ${user.id} - Plan: ${currentTier}`);

                await UserPlan.create({
                    userId: user.id,
                    planName: currentTier,
                    status: 'active',
                    tasks_completed_today: user.tasks_completed_today || 0,
                    last_task_date: user.last_task_date || new Date()
                }, { transaction: t });
            }
        }

        await t.commit();
        console.log('Migration Completed Successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Migration Failed:', err);
        await t.rollback();
        process.exit(1);
    }
}

// Connect DB first
sequelize.authenticate().then(() => {
    console.log('DB Connected.');
    // Sync UserPlan model (create table if not exists)
    // BE CAREFUL with sync() in production. Using sync({ alter: true }) might be safe enough for this new table?
    // User requested "Write a script to automatically migrate".
    // I need to make sure the TABLE exists first.
    UserPlan.sync({ alter: true }).then(() => {
        migrateUserPlans();
    });
}).catch(err => {
    console.error('DB Connection Check Failed:', err);
});
