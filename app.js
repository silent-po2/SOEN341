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
// let passport = require('passport');
// let LocalStrategy = require('passport-local').Strategy;
// let urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * Function that can be used to format the objects that populate the
 * error array that is returned in req.validationErrors().
 *
 * @param {*} param
 * @param {*} msg
 * @param {*} value
 * @return {Object} A list of form parameters
 */
let validator = function(param, msg, value) {
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

const expressValidator = require('express-validator');
const port = process.env.PORT || 3000;
process.env.LOGGER_LEVEL = 'debug';

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

// Setup form validator middleware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
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
    }
  })
);

// Setup express with a logger
app.use(morgan('combined', { stream: winston.stream }));

// Load the routes of the app
require('./routes/users.js')(app);

// Launch application
let server = app.listen(port);
winston.info(`Listening to port ${port}`);

// Export only for testing
module.exports = app;
