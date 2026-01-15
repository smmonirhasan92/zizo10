require('dotenv').config();
process.env.USE_LOCAL_DB = 'true';
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database_local');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL.');

        // 1. Add accountStatus column
        try {
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN accountStatus ENUM('pending', 'active', 'suspended') 
                NOT NULL DEFAULT 'pending';
            `);
            console.log('✅ Added accountStatus column.');
        } catch (err) {
            if (err.parent && err.parent.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ accountStatus column already exists.');
            } else {
                console.error('❌ Error adding column:', err);
            }
        }

        // 2. Add Indexes
        try {
            await sequelize.query("CREATE INDEX idx_users_phone ON users(phone);");
            await sequelize.query("CREATE INDEX idx_users_username ON users(username);");
            await sequelize.query("CREATE INDEX idx_transactions_type ON transactions(type);");
            console.log('✅ Indexes created.');
        } catch (err) {
            console.log('ℹ️ Indexes might already exist or error:', err.message);
        }

        // 3. Set Admin to Active (Unlock Admin)
        // Assuming admin username is 'admin' or role is 'super_admin'
        await sequelize.query(`UPDATE users SET accountStatus = 'active' WHERE role IN ('admin', 'super_admin')`);
        console.log('✅ Admins activated.');

        // 4. Set a Test User to 'pending' for verification
        // Let's create one if not exists or pick one.
        // We will rely on existing data being 'pending' by default.

        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
