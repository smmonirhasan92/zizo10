const axios = require('axios');

async function testNotificationApi() {
    try {
        console.log("🚀 Testing Notification API...");

        // 1. Login to get Token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            phone: '01711111111',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log("🔑 Token Received");

        // 2. Call Notification API
        const res = await axios.get('http://localhost:5000/api/user/notifications/my', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ STATUS:", res.status);
        console.log("✅ DATA COUNT:", res.data.length);

    } catch (err) {
        if (err.response) {
            console.log("❌ STATUS:", err.response.status);
            console.log("❌ DATA:", err.response.data);
        } else {
            console.error("❌ ERROR:", err.message);
        }
    }
}

testNotificationApi();
