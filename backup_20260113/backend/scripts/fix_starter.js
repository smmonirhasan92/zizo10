const { sequelize, AccountTier } = require('../models');

async function fixStarter() {
    try {
        await sequelize.authenticate();
        console.log('Database Connected.');

        const starter = await AccountTier.findOne({ where: { name: 'Starter' } });
        if (starter) {
            starter.unlock_price = 0.00;
            starter.validity_days = 3650; // 10 Years (Free Forever basically)
            await starter.save();
            console.log('Starter Tier updated to Free (0.00).');
        } else {
            console.log('Starter Tier not found. Creating...');
            await AccountTier.create({
                name: 'Starter',
                unlock_price: 0.00,
                daily_limit: 5,
                task_reward: 2.00,
                validity_days: 3650,
                referral_bonus: 0.00
            });
            console.log('Starter Tier created.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

fixStarter();
