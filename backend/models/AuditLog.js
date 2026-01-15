const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    targetUserId: {
        type: DataTypes.INTEGER,
        allowNull: true // Can be null if action is general (e.g. system setting change)
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = AuditLog;
