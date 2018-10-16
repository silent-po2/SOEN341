/**
 * This is the file that runs when the web application is started.
 */

// Load dependencies
let http = require('http');
let fs = require('fs');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let Database = require('./db/Database');
let mysql = require('mysql');
let md5 = require('md5');
let session = require('express-session');
let winston = require('./config/winston');
let morgan = require('morgan');
// let passport = require('passport');
// let LocalStrategy = require('passport-local').Strategy;

const expressValidator = require('express-validator');
const port = process.env.PORT || 3000;
process.env.NODE_ENV = 'test';

// Application that contains get/post/put/delete methods
let app = express();

// load boostrap
app.set('view engine', 'pug');

// load view engine
app.set('views', path.join(__dirname, 'views'));

// set css and bootstrap folder
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

// todo: what is this -- warning for validation
app.use(require('connect-flash')());

// todo: what is this -- part of the flash message (warning for validation)
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
// todo: what is this -- form valitator middleware
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
app.listen(port);
winston.info(`Listening to port ${port}`);
module.exports = app; // For testing
