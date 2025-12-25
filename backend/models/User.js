const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    referral_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    referred_by: {
        type: DataTypes.STRING, // Storing code or ID? Let's store Code for easier lookup or ID? Code is safer? ID is better for relations.
        // Let's store referral_code string of referrer.
        allowNull: true
    },
    referral_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'employee_admin', 'agent', 'user'),
        defaultValue: 'user'
    },
    photoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    commissionRate: {
        type: DataTypes.DECIMAL(5, 2), // Percentage, e.g., 5.00
        defaultValue: 0.00,
        allowNull: false
    },
    kycStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'none'),
        defaultValue: 'none'
    },
    kycImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Zizo 10 v2.0 - Dual Wallet & Task System
    income_balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    purchase_balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    account_tier: {
        type: DataTypes.STRING,
        defaultValue: 'Starter',
        allowNull: false
    },
    last_task_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    tasks_completed_today: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    // Agent Settlement System
    agent_due: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = User;
