const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        logFormat
    ),
    transports: [
        // Console Transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        // File Transport - All Logs
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/app.log'),
            level: 'info'
        }),
        // File Transport - Critical Errors
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        // File Transport - Transactions (Audit Trail)
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/transactions.log'),
            level: 'info',
            format: winston.format.combine(
                winston.format((info) => info.isTransaction ? info : false)(), // Only log if isTransaction is true
                logFormat
            )
        })
    ]
});

// Custom Method for Transaction Auditing
logger.audit = (message, meta = {}) => {
    logger.info(message, { isTransaction: true, ...meta });
};

module.exports = logger;
