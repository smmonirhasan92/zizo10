const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPlan = sequelize.define('UserPlan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    planName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // We store the name to link with AccountTier safely even if IDs shift, 
    // but ideally we should link via ID. 
    // We will rely on Name as 'User.account_tier' does.

    status: {
        type: DataTypes.ENUM('active', 'expired', 'completed'),
        defaultValue: 'active'
    },
    tasks_completed_today: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_task_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    purchase_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
    // Indexes can be added here if needed
});

module.exports = UserPlan;
