const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccountTier = sequelize.define('AccountTier', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    daily_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    task_reward: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 2.00
    },
    reward_multiplier: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 1.00
    },
    unlock_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    validity_days: {
        type: DataTypes.INTEGER,
        defaultValue: 365
    },
    features: {
        type: DataTypes.JSON, // Array of feature strings
        defaultValue: []
    }
});

module.exports = AccountTier;
