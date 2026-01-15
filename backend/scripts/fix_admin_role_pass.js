const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log("🔌 Connected.");

        const phone = '01711111111';
        let user = await User.findOne({ where: { phone } });

        if (user) {
            console.log(`Found User: ${user.phone}, Role: '${user.role}'`);

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('123456', salt);
            user.role = 'super_admin'; // VALID ENUM
            user.accountStatus = 'active';

            await user.save();

            // Re-fetch
            const verified = await User.findOne({ where: { phone } });
            console.log(`Role After Save: '${verified.role}' (Expected: super_admin)`);
            console.log(`Password Hash: ${verified.password.substring(0, 20)}...`);

            if (verified.role === 'super_admin') {
                console.log("✅ Admin Fixed Successfully.");
            } else {
                console.error("❌ FAILED to update Role.");
            }
        } else {
            console.log("❌ User not found.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sequelize.close();
    }
}

fix();
