/**
 * Logger specific functions used for debugging purposes.
 * inspired by:
 * https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications
 */

let winston = require('winston');

// define the custom settings for each transport (file, console)
let options = {
  console: {
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    name: 'console.info',
    level: 'debug', // change this to info to receive only basic information
    handleExceptions: true,
    json: true,
    colorize: true,
    showLevel: true,
    silent: false
  }
};

// instantiate a new Winston Logger with the settings defined above
let logger = winston.createLogger({
  transports: [new winston.transports.Console(options.console)],
  exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
  /**
   * Output stream of what the logger prints to the console based on given level.
   *
   * @param {String} message
   * @param {Object} encoding
   */
  write: function(message, encoding) {
    logger.silly(message);
  }
};

module.exports = logger;
