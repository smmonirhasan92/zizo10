const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

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
    },
    // Admin Mediator System (Step 3)
    assignedAgentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    adminId: { // Admin who assigned the agent
        type: DataTypes.INTEGER,
        allowNull: true
    },
    agentStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        allowNull: true,
        defaultValue: 'pending'
    }
}, {
    tableName: 'deposit_requests',
    timestamps: true
});

module.exports = DepositRequest;
