const { sequelize, GlobalSetting } = require('./models');

async function testDB() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const settings = await GlobalSetting.findOne();
        console.log('Settings Found:', !!settings);
        if (settings) {
            console.log('signup_bonus value:', settings.signup_bonus); // Should be defined now
        } else {
            console.log('Settings table is empty. Creating default...');
            await GlobalSetting.create({ signup_bonus: 50 });
            console.log('Created default settings.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

testDB();
