const { sequelize, GlobalSetting, User } = require('./models');

async function syncDB() {
    try {
        await sequelize.authenticate();
        console.log('Connected. Syncing GlobalSettings ONLY...');

        // Sync ONLY GlobalSetting
        await GlobalSetting.sync({ alter: true });
        // Sync User (Added agent_due)
        // await User.sync({ alter: true }); // Disabled due to ER_TOO_MANY_KEYS

        // EMERGENCY FIX: Add column manually
        try {
            await sequelize.query("ALTER TABLE Users ADD COLUMN agent_due DECIMAL(10,2) NOT NULL DEFAULT 0.00;");
            console.log("Successfully added agent_due column via Raw SQL.");
        } catch (e) {
            console.log("Column agent_due likely already exists or error ignored: " + e.message);
        }

        console.log('GlobalSetting Sync Complete!');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

syncDB();
