const axios = require('axios');
const { User } = require('./models');

// Mock Authentication (bypass middleware or use valid token if needed, but for local test we might need token)
// Actually backend requires authMiddleware.
// We can use a script that connects to DB directly to emulate the query logic OR login first.
// Let's try to Login as Admin first.

async function verifySearch() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            phone: '01700000000', // Assuming this admin exists from previous context or seed
            password: 'password123' // Common dev password
        });

        const token = loginRes.data.token;
        console.log('Login Success. Token acquired.');

        // 2. Search for Phone (Prefix)
        console.log('Testing Phone Search (017...)...');
        const start = Date.now();
        const res1 = await axios.get('http://localhost:5000/api/admin/global-search?query=017', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Phone Search Time: ${Date.now() - start}ms`);
        console.log(`Users Found: ${res1.data.users.length}`);

        // 3. Search for Name (Full Text)
        console.log('Testing Name Search (Adm...)...');
        const start2 = Date.now();
        const res2 = await axios.get('http://localhost:5000/api/admin/global-search?query=Adm', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Name Search Time: ${Date.now() - start2}ms`);
        console.log(`Users Found: ${res2.data.users.length}`);

        // 4. Search for ID
        console.log('Testing ID Search (1)...');
        const start3 = Date.now();
        const res3 = await axios.get('http://localhost:5000/api/admin/global-search?query=1', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`ID Search Time: ${Date.now() - start3}ms`);
        console.log(`Users Found: ${res3.data.users.length}`);

    } catch (err) {
        console.error('Verification Failed:', err.message);
        if (err.response) console.error('Data:', err.response.data);
    }
}

verifySearch();
