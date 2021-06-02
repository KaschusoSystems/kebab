const winston = require('winston');

const loggerFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `[${timestamp}] [${level}]: ${message}`;
});

let logger;
function initLogger() {
    logger = winston.createLogger({
        level: getEnvLogLevel(),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            loggerFormat
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'app.log', level: 'debug' }),
        ]
    });
}

function getEnvLogLevel() {
    return 'debug';
}

if (!logger) {
    initLogger();
}

module.exports = logger;