const { User, sequelize } = require('../models');

async function checkData() {
    try {
        console.log("🔌 Connecting to MySQL...");
        await sequelize.authenticate();
        console.log("✅ MySQL Connected.");

        // Fetch Admin
        const admin = await User.findOne({
            where: { role: 'admin' },
            attributes: ['id', 'username', 'phone']
        });

        // Fetch User
        const user = await User.findOne({
            where: { role: 'user' },
            attributes: ['id', 'username', 'phone']
        });

        console.log("\n📊 Credentials Found:");
        if (admin) {
            console.log(`👤 Admin: ${admin.phone} (Password: Try 123456)`);
        } else {
            console.log("❌ No Admin found.");
        }

        if (user) {
            console.log(`👤 User: ${user.phone} (Password: Try 123456)`);
        } else {
            console.log("❌ No User found.");
        }

    } catch (err) {
        console.error("❌ DB Error:", err.message);
    } finally {
        await sequelize.close();
    }
}

checkData();
