const sequelize = require('../config/database_local'); // Force Local DB for this script
const { QueryTypes } = require('sequelize');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Add isWithdrawLocked to Users
        try {
            await queryInterface.addColumn('Users', 'isWithdrawLocked', {
                type: sequelize.Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            });
            console.log('✅ Added isWithdrawLocked to Users table.');
        } catch (error) {
            console.log('⚠️ isWithdrawLocked column might already exist or failed: ', error.message);
        }

        // 2. Add targetUserId to AuditLogs
        try {
            await queryInterface.addColumn('AuditLogs', 'targetUserId', {
                type: sequelize.Sequelize.INTEGER,
                allowNull: true
            });
            console.log('✅ Added targetUserId to AuditLogs table.');
        } catch (error) {
            console.log('⚠️ targetUserId column might already exist or failed: ', error.message);
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
