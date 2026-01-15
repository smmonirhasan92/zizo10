const { GameSetting, sequelize } = require('../models');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const setting = await GameSetting.findOne({ where: { settingName: 'deposit_agents' } });
        if (setting) {
            console.log('Found Setting:', setting.settingName);
            console.log('Value (Raw):', setting.settingValue);
            try {
                const parsed = JSON.parse(setting.settingValue);
                console.log('Value (Parsed):', JSON.stringify(parsed, null, 2));
            } catch (e) {
                console.error('JSON Parse Error:', e.message);
            }
        } else {
            console.log('Setting assignment "deposit_agents" NOT FOUND.');
        }

        const all = await GameSetting.findAll();
        console.log('All Settings:', all.map(s => s.settingName));

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

check();
