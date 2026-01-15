const { DataTypes } = require('sequelize');
const sequelize = process.env.USE_LOCAL_DB === 'true' ? require('../config/database_local') : require('../config/database');

const TaskProduct = sequelize.define('TaskProduct', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: { // 'ad_integrated', 'standard_review'
        type: DataTypes.STRING,
        defaultValue: 'standard_review'
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productImage: { // URL to uploaded image
        type: DataTypes.STRING,
        allowNull: false
    },
    reviewText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    adCode: { // Optional HTML/JS for Ad-Integrated tasks
        type: DataTypes.TEXT,
        allowNull: true
    },
    weekNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    targetPackage: { // 'Starter', 'Gold', 'VIP', 'All'
        type: DataTypes.STRING,
        defaultValue: 'All'
    },
    status: {
        type: DataTypes.STRING, // 'active', 'inactive'
        defaultValue: 'active'
    }
}, {
    timestamps: true
});

module.exports = TaskProduct;
