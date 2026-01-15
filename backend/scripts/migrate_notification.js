require('dotenv').config();
process.env.USE_LOCAL_DB = 'true';
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database_local');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL.');

        // Simple sync for new table
        const Notification = require('../models/Notification');
        await Notification.sync({ alter: true }); // Create table
        console.log('✅ Notification Table Synced.');

        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
