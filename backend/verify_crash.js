const axios = require('axios');
const mysql = require('mysql2/promise');

async function reproduceCrash() {
    try {
        console.log('Attemping to reproduce 500 Error...');
        // First get token
        const login = await axios.post('http://localhost:5000/api/auth/login', { phone: '01700000000', password: 'password123' })
            .catch(e => axios.post('http://localhost:5000/api/auth/login', { phone: '01700000000', password: '123456' }));

        const token = login.data.token;
        console.log('Token acquired.');

        // 1. Search with weird queries
        // Include '8801700000000' which is > Max Int (2147483647)
        const queries = ['User', '017', '1', 'undefined', 'null', '8801700000000'];

        for (const q of queries) {
            console.log(`Searching for "${q}"...`);
            try {
                await axios.get(`http://localhost:5000/api/admin/global-search?query=${q}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Success.');
            } catch (innerErr) {
                console.log(`Failed: ${innerErr.response?.status} - ${innerErr.response?.data?.message}`);
                if (innerErr.response?.status === 500) {
                    console.log('❌ 500 ERROR CAUGHT!');
                    console.log('Error Data:', innerErr.response?.data);
                }
            }
        }

    } catch (err) {
        console.log('\n❌ CRASH REPRODUCED!');
        console.log('Status:', err.response?.status);
        console.log('Data:', err.response?.data);
    }
}
reproduceCrash();
