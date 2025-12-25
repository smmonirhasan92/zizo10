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
        logging: console.log
    }
);

async function fixIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const [results] = await sequelize.query("SHOW INDEX FROM users");

        // Find duplicate indexes for username and phone
        const indexesToDrop = [];
        const keepIndexes = ['PRIMARY', 'username', 'phone']; // Keep originals if named simply

        results.forEach(idx => {
            const name = idx.Key_name;
            if (keepIndexes.includes(name)) return;

            // Logic: Drop any key starting with username_ or phone_
            if (name.startsWith('username_') || name.startsWith('phone_')) {
                if (!indexesToDrop.includes(name)) {
                    indexesToDrop.push(name);
                }
            }
        });

        console.log(`Found ${indexesToDrop.length} redundant indexes.`);

        for (const indexName of indexesToDrop) {
            console.log(`Dropping index: ${indexName}`);
            await sequelize.query(`ALTER TABLE users DROP INDEX \`${indexName}\``);
        }

        console.log('Cleanup Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixIndexes();
