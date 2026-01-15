const { User, sequelize } = require('../models');

async function inspect() {
    try {
        console.log("🔌 Connecting...");
        await sequelize.authenticate();

        const phone = '01711111111';
        const user = await User.findOne({ where: { phone } });

        if (user) {
            console.log(`✅ FOUND User: ${user.phone}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
            console.log(`   Account Status: ${user.accountStatus}`);
        } else {
            console.log("❌ User NOT found in DB.");
            // List all users to see what we have
            const allUsers = await User.findAll({ attributes: ['phone', 'role'] });
            console.log("   Existing Users:", allUsers.map(u => `${u.phone} (${u.role})`).join(', '));
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await sequelize.close();
    }
}

inspect();
