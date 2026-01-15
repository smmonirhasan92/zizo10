const { sequelize, AccountTier } = require('../models');

async function seedTiers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Ensure Schema is up to date
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        const tiers = [
            {
                name: 'Starter',
                daily_limit: 5,
                task_reward: 2.00, // Legacy support
                reward_multiplier: 1.00,
                unlock_price: 0.00,
                validity_days: 365
            },
            {
                name: 'Silver',
                daily_limit: 10,
                task_reward: 2.50,
                reward_multiplier: 1.25,
                unlock_price: 500.00,
                validity_days: 365
            },
            {
                name: 'Gold',
                daily_limit: 20,
                task_reward: 3.00,
                reward_multiplier: 1.50,
                unlock_price: 1500.00,
                validity_days: 365
            },
            {
                name: 'VIP',
                daily_limit: 50,
                task_reward: 5.00,
                reward_multiplier: 2.00,
                unlock_price: 5000.00,
                validity_days: 365
            }
        ];

        for (const tierData of tiers) {
            const [tier, created] = await AccountTier.findOrCreate({
                where: { name: tierData.name },
                defaults: tierData
            });

            if (!created) {
                // Update existing
                tier.reward_multiplier = tierData.reward_multiplier;
                tier.daily_limit = tierData.daily_limit; // Ensure limit is correct
                await tier.save();
                console.log(`Updated tier: ${tier.name}`);
            } else {
                console.log(`Created tier: ${tier.name}`);
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedTiers();
