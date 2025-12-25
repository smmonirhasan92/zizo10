const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DepositRequest = sequelize.define('DepositRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    proofImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    adminComment: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'deposit_requests',
    timestamps: true
});

module.exports = DepositRequest;
