const axios = require('axios');

async function verifyProfile() {
    try {
        console.log('Testing Profile Route...');
        // Login
        const login = await axios.post('http://localhost:5000/api/auth/login', { phone: '01700000000', password: 'password123' })
            .catch(e => axios.post('http://localhost:5000/api/auth/login', { phone: '01700000000', password: '123456' }));
        const token = login.data.token;
        const userId = login.data.user.id;
        console.log(`Logged in as ID: ${userId}`);

        // Get Profile
        console.log(`Fetching /api/admin/user/${userId}...`);
        const res = await axios.get(`http://localhost:5000/api/admin/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Success! Status:', res.status);
        console.log('User Name:', res.data.user?.fullName);
        console.log('Stats:', res.data.stats);

    } catch (err) {
        console.error('❌ FAILED:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}
verifyProfile();
