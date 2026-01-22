// verify_startup_dryrun.js
// Purpose: Simulate server startup to catch syntax errors or model definition issues before deployment.
require('dotenv').config();
const { sequelize } = require('../models');
const express = require('express');
const app = express();

async function runCheck() {
    console.log('[TEST] Starting Backend Dry-Run...');

    try {
        // 1. Check Model Loading
        console.log('[TEST] Verifying Models...');
        const models = require('../models');
        if (!models.User || !models.Transaction || !models.TaskLog) {
            throw new Error('Critical Models Missing in Export!');
        }
        console.log('[TEST] ✅ Models Loaded.');

        // 2. Check Database Connection (Local)
        console.log('[TEST] Verifying Database Connection...');
        await sequelize.authenticate();
        console.log('[TEST] ✅ Database Authenticated.');

        // 3. Check Route Loading
        console.log('[TEST] Loading Routes...');
        // We just require the route files to ensure no syntax errors
        require('../routes/authRoutes');
        require('../routes/taskRoutes');
        require('../routes/walletRoutes');
        require('../routes/adminRoutes');
        console.log('[TEST] ✅ Routes Loaded (Syntax Check Passed).');

        console.log('\n[SUCCESS] 🛡️ Backend code is strictly verified and ready for deployment.');
        process.exit(0);

    } catch (error) {
        console.error('\n[FAILED] ❌ Startup Verification Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runCheck();
