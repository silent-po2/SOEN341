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
   * TODO
   *
   * @param {*} message
   * @param {*} encoding
   */
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.silly(message);
  }
};

module.exports = logger;
