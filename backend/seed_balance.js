
const { User, Wallet } = require('./models');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

async function seedUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Update 01733333333 to password '333333'
        const phone3 = '01733333333';
        let user3 = await User.findOne({ where: { phone: phone3 } });
        if (user3) {
            user3.password = await bcrypt.hash('333333', 10);
            await user3.save();
            console.log(`Password for ${phone3} updated to 333333`);
        }

        // Update 01755555555 to password '555555'
        const phone5 = '01755555555';
        let user5 = await User.findOne({ where: { phone: phone5 } });
        if (user5) {
            user5.password = await bcrypt.hash('555555', 10);
            await user5.save();
            console.log(`Password for ${phone5} updated to 555555`);
        }

    } catch (error) {
        console.error('Error seeding:', error);
    } finally {
        await sequelize.close();
    }
}

seedUser();
