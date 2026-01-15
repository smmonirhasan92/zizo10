const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = process.env.USE_LOCAL_DB === 'true'
    ? require('./config/database_local').development
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

async function runMigration() {
    console.log('Connecting to database...');
    // Adapt config for mysql2
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.username || dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });

    console.log('Reading migration file...');
    const sql = fs.readFileSync(path.join(__dirname, 'scripts', 'add_search_indexes.sql'), 'utf8');

    // Split by semicolon to run statements individually (basic splitter)
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

    for (const stmt of statements) {
        if (stmt.trim()) {
            try {
                console.log(`Executing: ${stmt.substring(0, 50)}...`);
                await connection.query(stmt);
                console.log('Success.');
            } catch (err) {
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log('Index already exists, skipping.');
                } else {
                    console.error('Error executing statement:', err.message);
                }
            }
        }
    }

    console.log('Migration Complete.');
    await connection.end();
}

runMigration().catch(console.error);
