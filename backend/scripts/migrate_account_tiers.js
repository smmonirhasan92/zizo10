require('dotenv').config();
const { sequelize, AccountTier } = require('../models');

async function migrateAccountTiers() {
    try {
        console.log('🔄 Connecting to Database...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('🔄 Syncing AccountTier Table...');
        // Only sync the specific model to be safe
        await AccountTier.sync({ alter: true });
        console.log('✅ Table Synced.');

        console.log('🔄 Seeding Default Tiers...');
        const tiers = [
            { name: 'Starter', daily_limit: 0, task_reward: 0.00 },
            { name: 'VIP', daily_limit: 20, task_reward: 2.00 },
            { name: 'Premium', daily_limit: 50, task_reward: 5.00 },
            { name: 'Gold', daily_limit: 100, task_reward: 10.00 },
            { name: 'Diamond', daily_limit: 200, task_reward: 20.00 }
        ];

        for (const t of tiers) {
            const [tier, created] = await AccountTier.findOrCreate({
                where: { name: t.name },
                defaults: t
            });
            if (!created) {
                // Update limits if exists
                tier.daily_limit = t.daily_limit;
                tier.task_reward = t.task_reward;
                await tier.save();
            }
            console.log(`   -> Processed ${t.name} (Limit: ${t.daily_limit})`);
        }

        console.log('✅ MIGRATION COMPLETE. You can now restart the server.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }
}

migrateAccountTiers();
