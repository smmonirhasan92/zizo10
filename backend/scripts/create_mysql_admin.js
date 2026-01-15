const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        console.log("🔌 Connecting to MySQL...");
        await sequelize.authenticate();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        console.log("Creating Admin...");
        const admin = await User.create({
            username: 'superAdmin',
            email: 'admin@zizocom.com',
            phone: '01711111111', // Distinct from user
            password: hashedPassword,
            role: 'admin',
            fullName: 'Super Admin',
            accountStatus: 'active',
            country: 'Bangladesh', // Ensure schema compliance
            referral_code: 'ADMIN01'
        });

        console.log(`✅ Admin Created: ${admin.phone} / 123456`);

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            console.log("⚠️ Admin with this phone/email already exists.");
        } else {
            console.error("❌ Error:", err.message);
        }
    } finally {
        await sequelize.close();
    }
}

createAdmin();
