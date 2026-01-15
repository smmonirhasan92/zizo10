const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: { // Receiver
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: { // 'admin_message', 'system', 'promo'
        type: DataTypes.STRING,
        defaultValue: 'system'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['isRead'] }
    ]
});

module.exports = Notification;
