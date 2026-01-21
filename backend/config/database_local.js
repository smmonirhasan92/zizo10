const Sequelize = require('sequelize');
require('dotenv').config();

// Local Development Configuration
// This file is forced to use Local settings (SQLite Sandbox)
// to bypass broken XAMPP MySQL and enable instant testing.

console.log('⚠️  LOADED: database_local.js (Local SQLite Sandbox)');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database_local.sqlite',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ [LOCAL] Database connected successfully (SQLite Sandbox).');
    } catch (error) {
        console.error('❌ [LOCAL] DB Connection Failed:', error.message);
    }
};

testConnection();

module.exports = sequelize;
