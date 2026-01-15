const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function fixPassword() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const phone = '01985010101';
        const newPassword = 'Sir@0101'; // Force match user input

        const user = await User.findOne({ where: { phone } });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log(`Found user: ${user.fullName} (${user.phone})`);

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        console.log('-------------------------------------------');
        console.log(`Password for ${phone} has been RESET.`);
        console.log(`New Password: ${newPassword}`);
        console.log('-------------------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixPassword();
