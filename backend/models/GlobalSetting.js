const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GlobalSetting = sequelize.define('GlobalSetting', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    task_base_reward: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 5.00, // Default 5 Taka/Credit
        allowNull: false
    },
    daily_task_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        allowNull: false
    },
    ad_link_1: {
        type: DataTypes.STRING,
        defaultValue: 'https://example.com/ad1',
        allowNull: false
    },
    ad_link_2: {
        type: DataTypes.STRING,
        defaultValue: 'https://example.com/ad2',
        allowNull: false
    },
    min_withdraw_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 100.00,
        allowNull: false
    },
    referral_bonus_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10.00,
        allowNull: false
    },
    referral_bonus_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 50.00,
        allowNull: false
    },
    cash_out_commission_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 5.00, // Example default, can be changed by Admin
        allowNull: false
    },
    signup_bonus: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 20.00, // Default Signup Bonus
        allowNull: false
    },
    silver_requirement: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        allowNull: false
    },
    gold_requirement: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        allowNull: false
    },
    platinum_requirement: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        allowNull: false
    },
    diamond_requirement: {
        type: DataTypes.INTEGER,
        defaultValue: 250,
        allowNull: false
    },
    referral_reward_currency: {
        type: DataTypes.ENUM('income', 'purchase'),
        defaultValue: 'income',
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = GlobalSetting;
