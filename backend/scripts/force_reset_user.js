const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function forceResetUser() {
    try {
        console.log("🔌 Connecting...");
        await sequelize.authenticate();

        const phone = '01702020202';
        const newPass = '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPass, salt);

        let user = await User.findOne({ where: { phone } });

        if (user) {
            console.log(`👤 Found User: ${user.username}`);
            user.password = hashedPassword;
            user.accountStatus = 'active';
            await user.save();
            console.log("✅ User Password Updated to '123456'.");
        } else {
            console.log("❌ User not found. Creating...");
            await User.create({
                username: 'testUser',
                email: 'user@test.com',
                phone: phone,
                password: hashedPassword,
                role: 'user',
                fullName: 'Test User',
                accountStatus: 'active',
                country: 'Bangladesh',
                referral_code: 'USER01'
            });
            console.log("✅ Created Test User.");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await sequelize.close();
    }
}

forceResetUser();
