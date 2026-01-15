const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskAd = sequelize.define('TaskAd', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reviewText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    adLink: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = TaskAd;
