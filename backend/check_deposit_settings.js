const { GameSetting, sequelize } = require('./models');

async function check() {
    try {
        const setting = await GameSetting.findOne({ where: { settingName: 'deposit_agents' } });
        if (!setting) {
            console.log("No deposit_agents setting found.");
        } else {
            console.log("Raw Value:", setting.settingValue);
            try {
                const parsed = JSON.parse(setting.settingValue);
                console.log("Parsed:", JSON.stringify(parsed, null, 2));
            } catch (e) {
                console.log("Parse Error:", e.message);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
