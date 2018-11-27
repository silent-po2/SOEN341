/**
 * This is the file that runs when the web application is started.
 */

// Load dependencies
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let session = require('express-session');
let winston = require('./config/winston');
let morgan = require('morgan');
// global.Promise = require('bluebird');
// let passport = require('passport');
// let LocalStrategy = require('passport-local').Strategy;
// let urlencodedParser = bodyParser.urlencoded({ extended: false });

const expressValidator = require('express-validator');
const port = process.env.PORT || 3000;

// Catches unhandled promises rejections for debugging.
// process.on('unhandledRejection', error => {
//   winston.warn('unhandledRejection', error.message);
// });

// Application that contains get/post/put/delete methods
let app = express();

// Load boostrap
app.set('view engine', 'pug');

// Load view engine
app.set('views', path.join(__dirname, 'views'));

// Set css and bootstrap folder
app.use(express.static(path.join(__dirname, '/')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// // Passport
// app.use(passport.initialize());
// app.use(passport.session());

// Express Session Middleware
app.use(
  session({
    secret: 'secret_agent',
    resave: true,
    saveUninitialized: true
    // cookie: {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 1000 * 60 * 60 * 24 * 7
    // }
  })
);

// Setup flash to use during validation errors
app.use(require('connect-flash')());

// Setup part of the flash message (warning for validation)
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/**
 * Error formatter function for express validator
 *
 * @param {Object} param
 * @param {String} msg
 * @param {Object} value
 * @return {Object} A list of parameters
 */
let errorFormatter = function(param, msg, value) {
  let namespace = param.split('.');
  let root = namespace.shift();
  let formParam = root;

  while (namespace.length) {
    formParam += '[' + namespace.shift() + ']';
  }
  return {
    param: formParam,
    msg: msg,
    value: value
  };
};

// Setup form validator middleware
app.use(
  expressValidator({
    errorFormatter
  })
);

// Setup express with a logger
app.use(morgan('combined', { stream: winston.stream }));

// Load the routes of the app
require('./routes/route.js')(app);

// Launch application
let server = app.listen(port);
winston.info(`Listening to port ${port}`);

// Exporting app variables for testing
module.exports = app;

/**
 * Function that closes the application
 *
 */
function stop() {
  server.close();
}

module.exports.stop = stop;
