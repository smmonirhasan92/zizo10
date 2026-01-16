const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Or database_local if local testing

async function migrateTaskLog() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('TaskLogs');

        if (!tableDescription.taskId) {
            console.log('Adding taskId column...');
            await queryInterface.addColumn('TaskLogs', 'taskId', { type: Sequelize.STRING, allowNull: false, defaultValue: '0' });
        }
        if (!tableDescription.type) {
            console.log('Adding type column...');
            await queryInterface.addColumn('TaskLogs', 'type', { type: Sequelize.STRING, allowNull: false, defaultValue: 'general' });
        }
        if (!tableDescription.status) {
            console.log('Adding status column...');
            await queryInterface.addColumn('TaskLogs', 'status', { type: Sequelize.STRING, defaultValue: 'completed' });
        }
        if (!tableDescription.reward) {
            console.log('Adding reward column...');
            await queryInterface.addColumn('TaskLogs', 'reward', { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 });
        }

        // Also ensure date has default value if modifying

        console.log('TaskLog Migration Completed Successfully.');
    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        await sequelize.close();
    }
}

migrateTaskLog();
