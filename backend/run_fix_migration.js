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
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.username || dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });

    const sql = fs.readFileSync(path.join(__dirname, 'scripts', 'fix_ft_index.sql'), 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

    for (const stmt of statements) {
        if (stmt.trim()) {
            try {
                console.log(`Executing: ${stmt.substring(0, 50)}...`);
                await connection.query(stmt);
                console.log('Success.');
            } catch (err) {
                console.error(err.message);
            }
        }
    }
    await connection.end();
}
runMigration();
