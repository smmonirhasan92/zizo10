// Update to log errors to file
const fs = require('fs');
const path = require('path');

function logError(err, context) {
    const logPath = path.join(__dirname, '..', 'debug_controller_error.log');
    const msg = `[${new Date().toISOString()}] ${context}: ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(logPath, msg);
}
