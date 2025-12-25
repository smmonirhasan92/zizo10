const { sequelize } = require('../models');

console.log('Starting manual DB sync...');
console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    db: process.env.DB_NAME
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Database synced successfully! Tables should now exist.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error syncing database:', err);
        process.exit(1);
    });
