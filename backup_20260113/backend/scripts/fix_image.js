const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

async function fix() {
    try {
        await sequelize.authenticate();

        const [results] = await sequelize.query(
            "UPDATE TaskAds SET imageUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000' WHERE title LIKE '%MacBook%'"
        );

        console.log('Updated MacBook Image URL.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
