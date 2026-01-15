require('dotenv').config();
process.env.USE_LOCAL_DB = 'true';
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database_local');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL.');

        // 1. Add referredBy column
        try {
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN referredBy INTEGER NULL;
            `);
            console.log('✅ Added referredBy column.');
        } catch (err) {
            console.log('ℹ️ Column might already exist or error:', err.message);
        }

        // 2. Add Index
        try {
            await sequelize.query("CREATE INDEX idx_users_referredBy ON users(referredBy);");
            console.log('✅ Index created.');
        } catch (err) { }

        console.log('✅ Migration Complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
