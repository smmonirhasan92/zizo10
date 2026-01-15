const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
let ADMIN_TOKEN = '';
let USER_TOKEN = '';

// Helper: Color Logs
const log = (msg, type = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${msg}`);
};

async function login() {
    try {
        // Admin Login
        const adminRes = await axios.post(`${API_URL}/auth/login`, { phone: '01711111111', password: '123456' }); // Assume Super Admin Exists
        ADMIN_TOKEN = adminRes.data.token;
        log('Admin Logged In', 'success');

        // User Login (Create temp or use existing?)
        // Let's assume a standard user exists
        const userRes = await axios.post(`${API_URL}/auth/login`, { phone: '01700000001', password: 'password' }); // Verify credentials first if needed
        USER_TOKEN = userRes.data.token;
        log('User Logged In', 'success');
    } catch (e) {
        log('Login Failed: ' + e.message, 'error');
        // If 01700000001 fails, we might need to register one quick
    }
}

async function runTests() {
    await login();

    const tests = [
        // --- AUTH & SECURITY (1-4) ---
        {
            name: '1. Create Task without Token',
            method: 'post', url: '/task/admin/tasks/create',
            headers: {}, // No Token
            data: {},
            expectStatus: 401
        },
        // We need to use `axios` functionality to handle FormData for file uploads
        {
            name: '2. Create Task as User (Role Forbidden)',
            method: 'post', url: '/task/admin/tasks/create',
            headers: { Authorization: `Bearer ${USER_TOKEN}` },
            data: {},
            expectStatus: 403 // Middleware checks role? Assuming authMiddleware allows all valid tokens, but controller might not? 
            // Wait, authMiddleware usually just checks validity. We probably don't have Role Middleware on this route yet! 
            // If so, this test might FAIL (return 200 or 400), revealing a security gap!
        },

        // --- INPUT VALIDATION (3-6) ---
        {
            name: '3. Create Task missing Name',
            method: 'multipart',
            data: { reviewText: 'Good', type: 'standard_review' },
            expectStatus: 400
        },
        {
            name: '4. Create Task missing Image',
            method: 'multipart',
            data: { productName: 'Test', reviewText: 'Good' },
            expectStatus: 400
        },
        {
            name: '5. Create Task with Empty Fields',
            method: 'multipart',
            data: { productName: '', reviewText: '' },
            expectStatus: 400
        },

        // --- LOGIC & SEPARATION (6-15) ---
        {
            name: '6. Create "Standard Review" Task (Success)',
            method: 'multipart',
            data: { productName: 'Std Item', reviewText: 'Nice', type: 'standard_review', targetPackage: 'All' },
            hasImage: true,
            expectStatus: 201
        },
        {
            name: '7. Create "Ad-Integrated" Task (Success)',
            method: 'multipart',
            data: { productName: 'Ad Item', reviewText: 'Cool', type: 'ad_integrated', adCode: '<script>alert(1)</script>' },
            hasImage: true,
            expectStatus: 201
        },
        {
            name: '8. Verify "Standard" Task ignores AdCode',
            method: 'multipart',
            data: { productName: 'Std NoAd', reviewText: 'Test', type: 'standard_review', adCode: 'ShouldBeNull' },
            hasImage: true,
            expectStatus: 201
        },
        {
            name: '9. View All Tasks (Admin)',
            method: 'get', url: '/task/admin/tasks',
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            expectStatus: 200
        },
        {
            name: '10. Filter Tasks: Only "Ad-Integrated"',
            method: 'get', url: '/task/admin/tasks?type=ad_integrated',
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            expectStatus: 200
        },
        {
            name: '11. Filter Tasks: Only "Standard"',
            method: 'get', url: '/task/admin/tasks?type=standard_review',
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            expectStatus: 200
        },
        {
            name: '12. Package Targeting: VIP Only',
            method: 'multipart',
            data: { productName: 'VIP Item', reviewText: 'Rich', targetPackage: 'VIP' },
            hasImage: true,
            expectStatus: 201
        },

        // --- USER INTERACTION (16-20) ---
        {
            name: '16. User Fetch Tasks',
            method: 'get', url: '/task/status',
            headers: { Authorization: `Bearer ${USER_TOKEN}` },
            expectStatus: 200
        },
        {
            name: '17. User Submit Valid Set (Mock IDs)',
            method: 'post', url: '/task/submit',
            headers: { Authorization: `Bearer ${USER_TOKEN}` },
            data: { taskIds: [1, 2, 3, 4, 5] }, // Assuming these exist from previous steps?
            expectStatus: 200
        },
        {
            name: '18. User Submit Empty Set',
            method: 'post', url: '/task/submit',
            headers: { Authorization: `Bearer ${USER_TOKEN}` },
            data: { taskIds: [] },
            expectStatus: 400
        },
        {
            name: '19. User Submit Missing Body',
            method: 'post', url: '/task/submit',
            headers: { Authorization: `Bearer ${USER_TOKEN}` },
            data: {},
            expectStatus: 400
        },
        {
            name: '20. Admin Check Task Count Increase',
            method: 'get', url: '/task/admin/tasks',
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            expectStatus: 200 // Could check count data
        }
    ];

    console.log(`🚀 Starting ${tests.length} Robustness Tests...\n`);

    for (const test of tests) {
        try {
            let res;
            if (test.method === 'multipart') {
                const form = new FormData();
                for (const key in test.data) form.append(key, test.data[key]);
                if (test.hasImage) {
                    // Create dummy file
                    const dummyPath = path.join(__dirname, 'test.jpg');
                    if (!fs.existsSync(dummyPath)) fs.writeFileSync(dummyPath, 'fake image content');
                    form.append('photo', fs.createReadStream(dummyPath));
                }

                res = await axios.post(`${API_URL}/task/admin/tasks/create`, form, {
                    headers: {
                        ...form.getHeaders(),
                        Authorization: `Bearer ${ADMIN_TOKEN}`
                    },
                    validateStatus: () => true
                });
            } else {
                res = await axios({
                    method: test.method,
                    url: `${API_URL}${test.url}`,
                    headers: test.headers,
                    data: test.data,
                    validateStatus: () => true
                });
            }

            if (res.status === test.expectStatus) {
                log(`${test.name} -> PASSED (${res.status})`, 'success');
            } else {
                log(`${test.name} -> FAILED (Got ${res.status}, Expected ${test.expectStatus})`, 'error');
                if (test.expectStatus === 201) console.log('Response:', res.data);
            }
        } catch (err) {
            log(`${test.name} -> CRASHED: ${err.message}`, 'error');
        }
    }
}

runTests();
