const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = process.env.USE_LOCAL_DB === 'true'
    ? require('./config/database_local').development
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

async function runTest() {
    try {
        // 0. Force Activate Admin in DB
        console.log('--- Step 0: Preparing Admin User ---');
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.username || dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database
        });

        // Ensure user exists or update status
        // We assume 01700000000 exists from previous output
        await connection.query("UPDATE users SET accountStatus = 'active', role = 'super_admin' WHERE phone = '01700000000'");
        console.log('✅ Admin (01700000000) activated and promoted to super_admin.');
        await connection.end();

        // 1. Login
        console.log('\n--- Step 1: Logging in ---');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            phone: '01700000000',
            password: 'password123' // Or try 123456 if failed
        }).catch(async (e) => {
            if (e.response && e.response.status === 400) {
                console.log('Login failed with password123, trying 123456...');
                return await axios.post('http://localhost:5000/api/auth/login', {
                    phone: '01700000000',
                    password: '123456'
                });
            }
            throw e;
        });

        const token = loginRes.data.token;
        console.log('✅ Login Success.');

        // 2. Search for Phone (Prefix)
        console.log('\n--- Step 2: Testing Phone Search (017...) ---');
        const start = Date.now();
        const res1 = await axios.get('http://localhost:5000/api/admin/global-search?query=017', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`⏱️ Time: ${Date.now() - start}ms`);
        console.log(`📊 Users Found: ${res1.data.users.length}`);
        if (res1.data.users.length > 0) console.log('✅ Result 1:', res1.data.users[0].username);

        // 3. Search for Name (Full Text)
        console.log('\n--- Step 3: Testing Name Search (Use...) ---');
        const start2 = Date.now();
        const res2 = await axios.get('http://localhost:5000/api/admin/global-search?query=Use', { // Assuming 'User' or similar common name
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`⏱️ Time: ${Date.now() - start2}ms`);
        console.log(`📊 Users Found: ${res2.data.users.length}`);

        // 4. Search for ID
        console.log('\n--- Step 4: Testing ID Search (1) ---');
        const start3 = Date.now();
        const res3 = await axios.get('http://localhost:5000/api/admin/global-search?query=1', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`⏱️ Time: ${Date.now() - start3}ms`);
        console.log(`📊 Users Found: ${res3.data.users.length}`);

        // 5. Check Structure
        if (res3.data.users[0].income_balance !== undefined) {
            console.log('✅ Balances included in response.');
        } else {
            console.log('❌ Balances MISSING in response.');
        }

    } catch (err) {
        console.error('❌ Verification Failed:', err.message);
        if (err.response) console.error('Data:', err.response.data);
    }
}

runTest();
