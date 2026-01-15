const axios = require('axios');

async function testRegister() {
    try {
        console.log("🚀 Testing Register API...");
        const randomPhone = '019' + Math.floor(10000000 + Math.random() * 90000000);

        const res = await axios.post('http://localhost:5000/api/auth/register', {
            fullName: 'Test Register',
            phone: randomPhone,
            password: '123456',
            country: 'Bangladesh',
            referralCode: ''
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

testRegister();
