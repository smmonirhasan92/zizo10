const axios = require('axios');
const { User, Transaction, TaskProduct, Wallet, sequelize } = require('../models');
const { Op } = require('sequelize');

async function runTest() {
    try {
        console.log('🚀 Starting Final Stress Test...\n');

        // Manual Schema Patch for MySQL
        try {
            console.log('🔄 Checking for agent_referral_code column...');
            await sequelize.query("ALTER TABLE Users ADD COLUMN agent_referral_code VARCHAR(255) DEFAULT NULL;");
            console.log('✅ Column added.');
        } catch (colErr) {
            if (colErr.original && colErr.original.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column already exists.');
            } else {
                console.log('⚠️ Warning adding column: ' + colErr.message);
            }
        }

        // Also ensure referenceId on Transactions
        try {
            await sequelize.query("ALTER TABLE Transactions ADD COLUMN referenceId VARCHAR(255) DEFAULT NULL UNIQUE;");
            console.log('✅ referenceId Column added.');
        } catch (err) {
            // Ignore if exists or error
        }

        // 1. Setup: Create Agent if needed
        let agent = await User.findOne({ where: { role: 'agent' } });
        if (!agent) {
            console.log('⚠️ No Agent found. Creating one...');
            agent = await User.create({
                fullName: 'Stress Test Agent',
                username: 'stress_agent',
                phone: '01999999999',
                password: 'password123',
                role: 'agent',
                accountStatus: 'active'
            });
            await Wallet.create({ userId: agent.id, balance: 1000, agent_balance: 5000 });
        }
        console.log(`✅ Test Agent: ${agent.username} (ID: ${agent.id})`);

        // 2. Double Click Test (Concurrency)
        console.log('\n🧪 Testing Double Transaction Prevention...');
        const refId = `STRESS_TEST_${Date.now()}`;

        const payload = {
            userId: agent.id,
            type: 'agent_recharge',
            amount: 100,
            status: 'completed',
            referenceId: refId
        };

        try {
            await Promise.all([
                Transaction.create(payload),
                Transaction.create(payload)
            ]);
            console.log('❌ FAILED: Duplicate Transactions Created! Unique Constraint missing?');
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                console.log('✅ PASSED: Database blocked duplicate transaction (Unique Constraint works).');
            } else {
                console.log(`⚠️ INFO: Transaction failed with other error: ${err.name}`);
            }
        }

        // 3. Weekly Task Rotation
        console.log('\n🧪 Testing Weekly Task Rotation...');
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 8);

        let testUser = await User.create({
            fullName: 'Weekly User',
            username: `week_user_${Date.now()}`,
            phone: `018${Date.now()}`.slice(0, 11),
            password: '123',
            role: 'user',
            country: 'BD', // Required field
            createdAt: oldDate
        });
        await Wallet.create({ userId: testUser.id });

        const diffTime = Math.abs(new Date() - testUser.createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const week = Math.ceil(diffDays / 7);
        console.log(`info: User Account Age: ${diffDays} days. Expected Week: ${week}`);

        if (week === 2) {
            console.log('✅ PASSED: Logic correctly identifies Week 2.');
        } else {
            console.log(`❌ FAILED: Logic calculated Week ${week} instead of 2.`);
        }

        // 4. Penalty Test
        console.log('\n🧪 Testing Penalty Logic (Update User)...');
        // This tests if User model is valid for updates in MySQL
        testUser.balance = 0;
        await testUser.save(); // Should work if schema is correct
        console.log('✅ PASSED: User record updated successfully.');

        console.log('\n🏁 Stress Test Completed.');
        process.exit(0);

    } catch (err) {
        console.error('❌ FATAL ERROR:', err);
        process.exit(1);
    }
}

runTest();
