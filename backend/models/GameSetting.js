const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GameSetting = sequelize.define('GameSetting', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    settingName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    settingValue: {
        type: DataTypes.TEXT, // Changed to TEXT to support long JSON strings
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = GameSetting;
