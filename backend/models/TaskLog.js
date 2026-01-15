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
        allowNull: false
    },
    amount_earned: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = TaskLog;
