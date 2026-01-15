const Sequelize = require('sequelize');
require('dotenv').config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

const sequelize = new Sequelize(
    process.env.DB_NAME || 'walet-game',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql',
        storage: process.env.DB_STORAGE || 'database.sqlite', // For SQLite
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 60000,
        },
        retry: {
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            max: MAX_RETRIES,
            timeout: 10000
        }
    }
);

// Self-healing connection test
const testConnection = async (retries = MAX_RETRIES) => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully with pooling.');
    } catch (error) {
        if (retries > 0) {
            console.error(`❌ DB Connection Failed. Retrying in ${RETRY_DELAY / 1000}s... (${retries} attempts left)`);
            setTimeout(() => testConnection(retries - 1), RETRY_DELAY);
        } else {
            console.error('❌ FATAL: Could not connect to database after multiple attempts:', error.message);
        }
    }
};

testConnection();

module.exports = sequelize;
