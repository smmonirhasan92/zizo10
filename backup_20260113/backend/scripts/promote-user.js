const { User, sequelize } = require('../models');

async function promoteUser() {
    try {
        const phone = '01985010101';
        const user = await User.findOne({ where: { phone } });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log(`Current Role: ${user.role}`);
        user.role = 'admin';
        await user.save();
        console.log(`Updated Role: ${user.role}`);
        console.log('User promoted to Admin successfully.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

promoteUser();
