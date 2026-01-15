const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function changePassword() {
    try {
        await sequelize.authenticate();
        console.log('Database Connected.');

        // Get arguments from command line
        // Usage: node scripts/change-password.js <phone> <new_password>
        const args = process.argv.slice(2);
        const phone = args[0];
        const newPassword = args[1];

        if (!phone || !newPassword) {
            console.error('❌ Usage: node scripts/change-password.js <phone> <new_password>');
            return;
        }

        const user = await User.findOne({ where: { phone } });

        if (!user) {
            console.error(`❌ User not found with phone: ${phone}`);
            return;
        }

        console.log(`✅ Found User: ${user.fullName} (${user.role})`);

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user
        user.password = hashedPassword;
        await user.save();

        console.log('---------------------------------------------------');
        console.log(`✅ Password Changed Successfully for ${phone}`);
        console.log(`🔐 New Password: ${newPassword}`);
        console.log('---------------------------------------------------');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

changePassword();
