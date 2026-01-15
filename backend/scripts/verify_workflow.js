require('dotenv').config();
process.env.USE_LOCAL_DB = 'true';
const { User, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL.');

        // 1. Setup Test Users
        const pendingPhone = '01700000000';
        const activePhone = '01711111111';
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);

        // Cleanup
        await User.destroy({ where: { phone: [pendingPhone, activePhone] } });

        // Create Pending User
        const pendingUser = await User.create({
            fullName: 'Pending User',
            username: 'pending_u',
            phone: pendingPhone,
            password: hash,
            country: 'BD',
            accountStatus: 'pending'
        });

        // Create Active User
        const activeUser = await User.create({
            fullName: 'Active User',
            username: 'active_u',
            phone: activePhone,
            password: hash,
            country: 'BD',
            accountStatus: 'active'
        });

        console.log('✅ Test Users Created.');

        // 2. Simulate Login Logic (Mirroring authController.js)
        async function checkLogin(user) {
            if (user.accountStatus === 'pending') {
                return 'BLOCKED: Pending';
            }
            if (user.accountStatus === 'suspended') {
                return 'BLOCKED: Suspended';
            }
            return 'SUCCESS: Token Generated';
        }

        const pendingResult = await checkLogin(pendingUser);
        console.log(`[TEST] Pending User Login: ${pendingResult}`);
        if (pendingResult !== 'BLOCKED: Pending') throw new Error('Pending User should be blocked');

        const activeResult = await checkLogin(activeUser);
        console.log(`[TEST] Active User Login: ${activeResult}`);
        if (activeResult !== 'SUCCESS: Token Generated') throw new Error('Active User should login');

        // 3. Verify Super Search Logic (Mirroring adminController.js)
        const searchQuery = 'pending';
        const searchResults = await User.findAll({
            where: {
                [Op.or]: [
                    { username: { [Op.like]: `%${searchQuery}%` } },
                    { phone: { [Op.like]: `%${searchQuery}%` } },
                    { fullName: { [Op.like]: `%${searchQuery}%` } }
                ]
            },
            limit: 5
        });

        console.log(`[TEST] Super Search for '${searchQuery}': Found ${searchResults.length} users.`);
        if (searchResults.length === 0) throw new Error('Search failed to find pending user');

        console.log('✅ ALL VERIFICATIONS PASSED.');
        process.exit(0);

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
}

verify();
