const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

const TaskLog = sequelize.define('TaskLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    amount_earned: { // Legacy field, mapping to reward
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Changed to true as we might use 'reward' instead or sync them
    },
    // New Anti-Cheat Columns
    taskId: {
        type: DataTypes.STRING, // Supports both ID and Ad Code
        allowNull: false,
        defaultValue: 'legacy_data' // Prevent startup crash on existing rows
    },
    type: {
        type: DataTypes.STRING, // 'ad', 'review', etc.
        allowNull: false,
        defaultValue: 'daily_task' // Prevent startup crash on existing rows
    },
    status: {
        type: DataTypes.STRING, // 'completed', 'pending'
        defaultValue: 'completed'
    },
    reward: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['date'] },
        { fields: ['taskId'] }, // Faster duplicate checks
        { fields: ['type'] },   // Faster filtering by type
        { fields: ['userId', 'date'] } // Faster daily check combinations
    ]
});

module.exports = TaskLog;
