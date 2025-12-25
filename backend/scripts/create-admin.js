const { User, sequelize } = require('../models');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const phone = '01ADMIN0000';
        let user = await User.findOne({ where: { phone } });

        if (!user) {
            // Create new admin if not exists
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            user = await User.create({
                fullName: 'Super Admin',
                username: 'admin',
                phone: phone,
                country: 'BD',
                password: hashedPassword,
                role: 'admin',
                kycStatus: 'approved'
            });
            console.log('Admin User Created!');
        } else {
            // Promote if exists but not admin
            if (user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
                console.log('User Promoted to Admin!');
            } else {
                console.log('Admin User already exists and correct.');
            }
        }
        console.log('-----------------------------------');
        console.log('ADMIN LOGIN CREDENTIALS:');
        console.log('Phone: 01ADMIN0000');
        console.log('Pass:  admin123');
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
