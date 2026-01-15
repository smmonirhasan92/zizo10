const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

const Setting = sequelize.define('Setting', {
    settingName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    settingValue: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Setting;
