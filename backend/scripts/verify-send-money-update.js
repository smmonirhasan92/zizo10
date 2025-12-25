const axios = require('axios');
const { Transaction, User, Wallet, sequelize } = require('../models');

const API_URL = 'http://localhost:5000/api';

async function testSendMoneyUpdate() {
    // Generate random user
    const randomPhone = '017' + Math.floor(10000000 + Math.random() * 90000000);
    const password = 'Password123';

    console.log(`--- Test User: ${randomPhone} ---`);

    try {
        // 1. Register
        console.log('Registering...');
        await axios.post(`${API_URL}/auth/register`, {
            fullName: 'Test User',
            phone: randomPhone,
            country: 'Bangladesh',
            password: password,
            deviceToken: 'test-token'
        });

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, { phone: randomPhone, password: password });
        const token = loginRes.data.token;
        const userId = loginRes.data.user.id;
        console.log('Login successful.');

        // 3. Add Funds (Direct DB)
        console.log('Injecting funds...');
        await Wallet.update({ balance: 5000 }, { where: { userId } });

        // 4. Send Money Request
        console.log('Sending Money (Agent)...');
        await axios.post(`${API_URL}/transaction/send`, {
            recipientPhone: '01900000000',
            amount: 500,
            method: 'nagad',
            accountType: 'Agent'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Request sent.');

        // 5. Verify
        const transaction = await Transaction.findOne({
            where: { userId, type: 'send_money' },
            order: [['createdAt', 'DESC']]
        });

        console.log('Recipient Details:', transaction.recipientDetails);

        if (transaction.recipientDetails.includes('Agent')) {
            console.log('✅ PASS: Account Type "Agent" saved correctly.');
        } else {
            console.error('❌ FAIL: Account Type missing.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

testSendMoneyUpdate();
