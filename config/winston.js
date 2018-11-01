/**
 * Logger specific functions used for debugging purposes.
 * inspired by:
 * https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications
 */

let appRoot = require('app-root-path');
let winston = require('winston');

// define the custom settings for each transport (file, console)
let options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    name: 'console.info',
    level: process.env.NODE_ENV === 'test' ? [] : process.env.LOGGER_LEVEL,
    handleExceptions: true,
    json: false,
    colorize: true,
    showLevel: true
  }
};

// instantiate a new Winston Logger with the settings defined above
let logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
  /**
   * TODO
   *
   * @param {*} message
   * @param {*} encoding
   */
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    if (process.env.NODE_ENV !== 'test') {
      logger.info(message);
    }
  }
};

module.exports = logger;
