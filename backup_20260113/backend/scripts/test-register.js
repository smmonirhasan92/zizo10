const { User, Wallet, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function testRegistration() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync(); // Ensure tables exist

        const fullName = 'Test Script User';
        const phone = '01888888888';
        const country = 'BD';
        const password = '123';

        // Check if user already exists
        let user = await User.findOne({ where: { phone } });
        if (user) {
            console.log('User already exists in DB');
            // Clean up
            await user.destroy();
            console.log('User destroyed for retry');
        }

        // Generate Username
        const username = fullName.split(' ')[0].toLowerCase() + Math.floor(1000 + Math.random() * 9000);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Creating user...');
        // Create User
        user = await User.create({
            fullName,
            username,
            phone,
            country,
            password: hashedPassword,
            kycStatus: 'none'
        });
        console.log('User ID:', user.id);

        console.log('Creating wallet...');
        // Create Wallet
        await Wallet.create({
            userId: user.id
        });
        console.log('Wallet created successfully.');

    } catch (error) {
        console.error('TEST SCRIPT ERROR:', error);
    } finally {
        await sequelize.close();
    }
}

testRegistration();
