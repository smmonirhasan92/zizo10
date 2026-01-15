const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

const TaskSchedule = sequelize.define('TaskSchedule', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    targetPackage: { // 'Starter', 'Gold', 'VIP', 'All'
        type: DataTypes.STRING,
        allowNull: false
    },
    weekNumber: { // 1, 2, 3, 4... (0 = All Weeks / Default)
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    taskType: { // 'ad_task' (Old), 'review_task' (New Smart), 'mixed'
        type: DataTypes.STRING,
        allowNull: false
    },
    taskCount: { // Number of tasks to assign
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
}, {
    timestamps: true
});

module.exports = TaskSchedule;
