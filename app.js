let http = require('http');
let fs = require('fs');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let app = express();
const port = 3000;
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let Database = require('./db/db');
let mysql = require('mysql');
let md5 = require('md5');
let session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set css and bootstrap folder
app.use(express.static(path.join(__dirname, 'node_modules')));

// Express Session Middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  })
);

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
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

// GET HOME PAGE
app.get('/home', (req, res) => {
  res.render('home', { qs: req.query });
});

app.get('/', (req, res) => {
  res.render('home', { qs: req.query });
});

// GET AND POST DASHBOARD
app.get('/dashboard', (req, res) => {
  let sql = 'SELECT * FROM messages';
  db.query(sql, function(err, result) {
    if (err) throw err;
    let jr = JSON.stringify(result);
    res.render('dashboard', {
      result: jr,
      qs: req.query
    });
  });
});
// test code
// app.get('/dashboard', (req, res) => {
//   let sql = 'SELECT * FROM messages';
//   db.query(sql, function(err, result) {
//     if (err) throw err;
//     // let resultlen = result.length;
//     console.log(result);
//     res.render('dashboard', { resultlen: '123123' });
//   });
// });

app.post('/dashboard', urlencodedParser, (req, res) => {
  let message = req.body.message;
  let errors = req.validationErrors();
  req.checkBody('message', 'Message is required').notEmpty();
  if (errors) {
    res.render('dashboard', {
      errors: errors
    });
  } else {
    let sql = 'INSERT INTO messages (Message) VALUES (?)';
    db.query(sql, [message], function(err, result) {
      if (err) throw err;
      console.log('1 message inserted');
    });
    res.redirect('back');
  }
});

// GET AND POST parentLogin
app.get('/parentLogin', (req, res) => {
  res.render('parentLogin', { qs: req.query });
});
app.post('/parentLogin', urlencodedParser, (req, res) => {
  let uEmail = req.body.email.toLowerCase();
  let uPassword = md5(req.body.password);

  // validate the inputs
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();

  let errors = req.validationErrors();
  // haven't used login method, will change later
  if (errors) {
    res.render('parentLogin', {
      errors: errors
    });
  } else {
    let sql = "SELECT * FROM user WHERE Email = '" + uEmail + "'";
    db.query(sql, function(err, result) {
      if (err) throw err;
      else {
        if (result.length > 0) {
          if (result[0].Password == uPassword) {
            console.log('logged in');
            req.flash('success', 'You are logged in.');
            let sql = 'SELECT * FROM messages';
            db.query(sql, function(err, result) {
              if (err) throw err;
              let jr = JSON.stringify(result);
              res.render('dashboard', {
                result: jr,
                qs: req.query
              });
            });
          } else {
            req.flash('danger', 'Password incorrect, please try again');
            console.log('password incorrect');
            res.render('parentLogin', { qs: req.query });
          }
        } else {
          req.flash('danger', 'No user is found, please try again');
          console.log('no user found');
          res.render('parentLogin', { qs: req.query });
        }
      }
    });
  }
});

// GET AND POST parentregister
app.get('/parentregister', (req, res) => {
  res.render('parentregister', { qs: req.query });
});
app.post('/parentregister', urlencodedParser, (req, res) => {
  let uEmail = req.body.email.toLowerCase();
  let uFirstName = req.body.firstname;
  let uLastName = req.body.lastname;
  let uPassword = md5(req.body.password);
  // validate the inputs
  req.checkBody('firstname', 'Firstname is required').notEmpty();
  req.checkBody('lastname', 'Lastname is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req
    .checkBody('password2', 'Passwords do not match')
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('parentregister', {
      errors: errors
    });
  } else {
    console.log(uEmail, uFirstName, uLastName, uPassword);

    let sql =
      'INSERT INTO user (Email, FirstName, LastName, Password) VALUES (?,?,?,?)';

    db.query(sql, [uEmail, uFirstName, uLastName, uPassword], function(
      err,
      result
    ) {
      console.log('1 record inserted');
      if (err) throw err;

      req.flash('success', 'You are registered, please log in.');
      res.render('parentlogin', { qs: req.query });
    });
  }
});

// GET AND POST teacherLogin
app.get('/teacherLogin', urlencodedParser, (req, res) => {
  res.render('teacherLogin', { qs: req.query });
});
app.post('/teacherLogin', urlencodedParser, (req, res) => {
  let uEmail = req.body.email.toLowerCase();
  let uPassword = md5(req.body.password);

  // validate the inputs
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();

  let errors = req.validationErrors();
  // haven't used login method, will change later
  if (errors) {
    res.render('teacherLogin', {
      errors: errors
    });
  } else {
    let sql = "SELECT * FROM user WHERE Email = '" + uEmail + "'";
    db.query(sql, function(err, result) {
      if (err) throw err;
      else {
        if (result.length > 0) {
          if (result[0].Password == uPassword) {
            console.log('logged in');
            req.flash('success', 'You are logged in.');
            let sql = 'SELECT * FROM messages';
            db.query(sql, function(err, result) {
              if (err) throw err;
              let jr = JSON.stringify(result);
              res.render('dashboard', {
                result: jr,
                qs: req.query
              });
            });
          } else {
            console.log('password incorrect');
            req.flash('danger', 'Password incorrect, please try again');
            res.render('teacherLogin', { qs: req.query });
          }
        } else {
          console.log('no user found');
          req.flash('danger', 'No user is found, please try again');
          res.render('teacherLogin', { qs: req.query });
        }
      }
    });
  }
});

// GET AND POST teacherregister
app.get('/teacherregister', (req, res) => {
  res.render('teacherregister', { qs: req.query });
});

app.post('/teacherregister', urlencodedParser, (req, res) => {
  let uEmail = req.body.email.toLowerCase();
  let uFirstName = req.body.firstname;
  let uLastName = req.body.lastname;
  let uPassword = md5(req.body.password);
  // validate the inputs
  req.checkBody('firstname', 'Firstname is required').notEmpty();
  req.checkBody('lastname', 'Lastname is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req
    .checkBody('password2', 'Passwords do not match')
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('teacherregister', {
      errors: errors
    });
  } else {
    console.log(uEmail, uFirstName, uLastName, uPassword);
    let sql =
      'INSERT INTO user (Email, FirstName, LastName, Password) VALUES (?,?,?,?)';
    db.query(sql, [uEmail, uFirstName, uLastName, uPassword], function(
      err,
      result
    ) {
      if (err) throw err;
      console.log('1 record inserted');
      req.flash('success', 'You are registered, please log in.');
      res.render('teacherlogin', { qs: req.query });
    });
  }
});

app.listen(3000, '127.0.0.1');
console.log('listening to port 3000');

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

// Instantiate database
// This will start a single instance of a db, it will only connect when u call the query function or any function that uses the query function from within db.js
let db = new Database({
  host: '35.221.26.86',
  database: 'kiwidb',
  user: 'root',
  password: 'soen341'
});

// text code:
// db.login("admin@gmail.com", "admin").catch(err => {
//   console.log(err);
// });
// var uEmail = "Davidseechan@gmail.com";
// var sql = "SELECT * FROM user WHERE Email = '"+ uEmail+"'";
// console.log(sql);
// db.query(sql, function (err, result, fields) {
//   if (err) throw err;
//   console.log(result);
// });

// let sql = "DELETE FROM user WHERE FirstName = 'Xi'";
// db.query(sql, function(err, result) {
//   if (err) throw err;
//   console.log('Number of records deleted: ' + result.affectedRows);
// });

db.query('SELECT * FROM user', function(err, result, fields) {
  if (err) throw err;
  console.log(result);
});

// db.query('CREATE TABLE messages (Message VARCHAR(255))', function(
//   err,
//   result,
//   fields
// ) {
//   if (err) throw err;
//   console.log(result);
// });

// db.query('SELECT * FROM messages', function(err, result, fields) {
//   if (err) throw err;
//   console.log(result);
// });

// let sql = "DELETE FROM messages WHERE Message = 'hello'";
// db.query(sql, function(err, result) {
//   if (err) throw err;
//   console.log('Number of records deleted: ' + result.affectedRows);
// });
