const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function getCredentials() {
    try {
        const t = await sequelize.transaction();

        // 1. Ensure Admin
        let admin = await User.findOne({ where: { role: 'admin' }, transaction: t });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);
            admin = await User.create({
                username: 'admin',
                email: 'admin@test.com',
                phone: '01700000000',
                password: hashedPassword,
                role: 'admin',
                fullName: 'Super Admin',
                accountStatus: 'active'
            }, { transaction: t });
            console.log("✅ Created Admin: 01700000000 / 123456");
        } else {
            console.log(`✅ Found Admin: ${admin.phone} (Use existing password, likely 123456 or password123)`);
        }

        // 2. Ensure User
        let user = await User.findOne({ where: { role: 'user' }, transaction: t });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);
            user = await User.create({
                username: 'sojib_user',
                email: 'user@test.com',
                phone: '01900000000',
                password: hashedPassword,
                role: 'user',
                fullName: 'Sojib Khan',
                accountStatus: 'active'
            }, { transaction: t });
            console.log("✅ Created User: 01900000000 / 123456");
        } else {
            console.log(`✅ Found User: ${user.phone} (Use existing password)`);
        }

        await t.commit();

    } catch (err) {
        console.error("Error Setup:", err);
    } finally {
        // await sequelize.close();
    }
}

getCredentials();
