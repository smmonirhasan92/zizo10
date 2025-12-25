const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GameLog = sequelize.define('GameLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gameType: {
        type: DataTypes.STRING, // e.g., 'head_tail'
        defaultValue: 'head_tail'
    },
    betAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    result: {
        type: DataTypes.ENUM('win', 'loss'),
        allowNull: false
    },
    payout: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    timestamps: true
});

module.exports = GameLog;
