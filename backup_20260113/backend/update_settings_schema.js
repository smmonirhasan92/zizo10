const { GlobalSetting, sequelize } = require('./models');

async function updateGlobalSettingsSchema() {
    try {
        console.log('Syncing GlobalSetting table...');
        await GlobalSetting.sync({ alter: true });
        console.log('GlobalSetting table updated successfully!');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await sequelize.close();
    }
}

updateGlobalSettingsSchema();
