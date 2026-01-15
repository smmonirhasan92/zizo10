const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function forceReset() {
    try {
        console.log("🔌 Connecting...");
        await sequelize.authenticate();

        const phone = '01711111111';
        const newPass = '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPass, salt);

        let user = await User.findOne({ where: { phone } });

        if (user) {
            console.log(`👤 Found User: ${user.username} (ID: ${user.id})`);
            console.log(`   Current Role: ${user.role}`);

            user.password = hashedPassword;
            user.role = 'admin'; // Enforce admin
            user.accountStatus = 'active';
            await user.save();
            console.log("✅ Updated Password to '123456' and Role to 'admin'.");
        } else {
            console.log("❌ User not found. Creating new Admin...");
            try {
                user = await User.create({
                    username: 'superAdminForce',
                    email: 'adminforce@test.com',
                    phone: phone,
                    password: hashedPassword,
                    role: 'admin',
                    fullName: 'Super Admin Force',
                    accountStatus: 'active',
                    country: 'Bangladesh',
                    referral_code: 'ADMINFORCE'
                });
                console.log("✅ Created New Admin.");
            } catch (createErr) {
                console.error("   ⚠️ Creation Failed (Unique Constraint?):", createErr.message);
                // Try finding by username if phone failed?
            }
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await sequelize.close();
    }
}

forceReset();
