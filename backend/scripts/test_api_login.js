const axios = require('axios');

async function testApi() {
    try {
        console.log("🚀 Testing Login API...");
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            phone: '01702020202',
            password: '123456'
        });

        console.log("✅ STATUS:", res.status);
        console.log("✅ DATA:", res.data);

    } catch (err) {
        if (err.response) {
            console.log("❌ STATUS:", err.response.status);
            console.log("❌ DATA:", err.response.data);
        } else {
            console.error("❌ ERROR:", err.message);
        }
    }
}

testApi();
