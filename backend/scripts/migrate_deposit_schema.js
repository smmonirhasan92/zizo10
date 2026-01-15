require('dotenv').config();
process.env.USE_LOCAL_DB = 'true';
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database_local');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL.');

        // 1. Add assignedAgentId column
        try {
            await sequelize.query(`
                ALTER TABLE deposit_requests 
                ADD COLUMN assignedAgentId INTEGER NULL,
                ADD COLUMN adminId INTEGER NULL,
                ADD COLUMN agentStatus ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending';
            `);
            console.log('✅ Added Mediator columns.');
        } catch (err) {
            console.log('ℹ️ Columns might already exist or error:', err.message);
        }

        console.log('✅ Migration Complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
