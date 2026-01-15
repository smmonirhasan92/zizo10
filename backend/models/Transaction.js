const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assignedAgentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('withdraw', 'recharge', 'send_money', 'cash_out', 'add_money', 'mobile_recharge', 'commission', 'admin_credit', 'admin_debit', 'purchase', 'task_reward', 'referral_bonus', 'activation_fee', 'wallet_transfer', 'game_win', 'game_loss', 'agent_recharge', 'agent_withdraw', 'admin_settlement'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    bonusAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'rejected'),
        defaultValue: 'pending'
    },
    recipientDetails: { // For send_money
        type: DataTypes.STRING,
        allowNull: true
    },
    proofImage: { // For pending recharge requests
        type: DataTypes.STRING,
        allowNull: true
    },
    adminComment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    receivedByAgentId: { // Agent who received the Add Money funds
        type: DataTypes.INTEGER,
        allowNull: true
    },
    referenceId: { // Unique constraint to prevent duplicate payments
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['type'] },
        { fields: ['status'] },
        // Index recipientDetails for searching "Bkash TrxID" (Note: Strings can be long, but usually short enough)
        { fields: ['recipientDetails'] }
    ]
});

module.exports = Transaction;
