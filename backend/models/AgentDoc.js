const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgentDoc = sequelize.define('AgentDoc', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    docType: {
        type: DataTypes.STRING, // e.g., 'trade_license', 'nid'
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = AgentDoc;
