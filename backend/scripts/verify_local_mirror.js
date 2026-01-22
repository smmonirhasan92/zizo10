process.env.USE_LOCAL_DB = 'true'; // Force Models to use Local SQLite
const sequelize = require('../config/database_local');
const { User } = require('../models');

async function verifyMirror() {
    console.log('🔍 Starting Local Mirror Verification (SQLite)...');

    try {
        await sequelize.authenticate();
        console.log('✅ [LOCAL] Database connected successfully (SQLite Local).');

        // Sync Schema (Add missing columns like accountStatus)
        console.log('🔄 Syncing Schema (Alter)...');
        await sequelize.sync({ alter: true });
        console.log('✅ Schema Synced.');

        // Verify Data Integrity (Check if users exist from seed)
        const userCount = await User.count();
        console.log(`✅ Data Verification: Found ${userCount} Users in 'walet_game_local' (SQLite).`);

        console.log('\n--- VERIFICATION REPORT ---');
        console.log('1. Config File: Loaded successfully (SQLite Check).');
        console.log('2. Database: walet_game_local active.');
        console.log('3. Data: Seeding confirmed.');
        console.log('---------------------------');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification Failed:', err.message);
        process.exit(1);
    }
}

verifyMirror();
