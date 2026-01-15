const { GameSetting, sequelize } = require('./models');

async function checkStatus() {
    try {
        await sequelize.authenticate();
        const setting = await GameSetting.findOne({ where: { settingName: 'game_status' } });
        console.log('CURRENT GAME STATUS:', setting ? setting.settingValue : 'Not Set (Default Active)');
    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await sequelize.close();
    }
}

checkStatus();
