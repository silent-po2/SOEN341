/**
 * This controller holds the responses that handle requests made to users.
 */

let User = require('../models/user');
let db = require('../db/Database');
let winston = require('../config/winston');

// Responds with user home page
exports.userHome = function(req, res) {
  res.render('../views/home.pug', {
    user: req.session.user
  });
};

// Responds with login
exports.login = function(req, res) {
  res.render('../views/login.pug', {
    title: 'Login'
  });
};

// Responds with profile
exports.profile = function(req, res) {
  // let userArr;
  // let userInfo = req.session.user;
  // for (let i = 0; i < userInfo.length; i++) {
  //   userArr.add;
  // }
  // res.render('../views/dashboard.pug', {
  //   userArr: userArr
  // });
  console.log(req.session.user);
  let user = req.session.user;
  let userArr = [user.id, user.email, user.firstName, user.lastName, user.type];
  res.render('../views/profile.pug', {
    title: 'Profile',
    userArr: userArr
  });
};

// Responds with logout
exports.logout = function(req, res) {
  if (req.session.user) {
    req.session.destroy();
    res.redirect('/login');
  } else {
    res.redirect('/login');
  }
};

// Responds with register
exports.register = function(req, res) {
  res.render('../views/register.pug', {
    title: 'Register'
  });
};

// Responds with dashboard
exports.dashboard = function(req, res) {
  if (req.session.user) {
    let msgArr = [];
    db.dashboardGet()
      .then(rows => {
        for (let i = 0; i < rows.length; i++) {
          msgArr[i] = rows[i].Message;
        }
        res.render('../views/dashboard.pug', {
          msgArr: msgArr,
          user: req.session.user
        });
      })
      .catch(error => {
        console.log(error);
        req.flash('danger', 'Fail to load messages, please try again.');
        res.redirect('/dashboard');
      });
  } else {
    res.redirect('/login');
  }
};

// Posts using dashboard
exports.dashboardPost = function(req, res) {
  let post = req.body.post;
  winston.debug('Posting: ' + post);
  if (post == '') {
    console.log(1234567890);
    req.flash('danger', 'Fail to post a message, please try again.');
    res.redirect('/dashboard');
  } else {
    db.post(post)
      .then(result => {
        // req.flash('success', 'Message posted');
        res.redirect('/dashboard');
      })
      .catch(error => {
        console.log(error);
        req.flash('danger', 'Fail to post a message, please try again.');
        res.redirect('/dashboard');
      });
  }
};

// Responds with login as teacher
exports.loginTeacherGet = function(req, res) {
  req.session.userType = 'T';
  res.render('../views/teacherLogin.pug');
};

// Responds with login as parent
exports.loginParentGet = function(req, res) {
  req.session.userType = 'P';
  res.render('../views/parentLogin.pug');
};

// Verifies login information and redirects to user profile
exports.loginPost = function(req, res) {
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  let type = req.body.userType;
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  winston.debug('Login user: ' + email + ' type: ' + type);
  let errors = req.validationErrors();

  // If inputs are not valid, render the page again
  if (errors) {
    res.render('../views/login.pug', {
      errors: errors
    });
  } else {
    // Else proceed with login verification
    db.login(email, password)
      .then(result => {
        console.log(result[0]);
        console.log(result[1]);
        console.log(result[2]);
        console.log(result[3]);
        console.log(result[4]);
        let user = new User(
          result[0],
          result[1],
          result[2],
          result[3],
          result[4],
          result[5]
        );
        req.session.user = user;
        req.flash('success', 'You are logged in.');
        res.redirect('/dashboard');
      })
      .catch(error => {
        console.log(error);
        req.flash(
          'danger',
          'Email not found or password incorrect, please try again.'
        );
        res.render('../views/login.pug');
      });
  }
};

// Responds with register as parent
exports.registerParentGet = function(req, res) {
  req.session.userType = 'P';
  res.render('../views/parentRegister.pug');
};

// Responds with register as teacher
exports.registerTeacherGet = function(req, res) {
  req.session.userType = 'T';
  res.render('../views/teacherRegister.pug');
};

// Performs the register action once values are validated
exports.registerPost = function(req, res) {
  let email = req.body.email.toLowerCase();
  let firstName = req.body.firstname;
  let lastName = req.body.lastname;
  let password = req.body.password;
  let password2 = req.body.password2;
  let type = req.body.userType;
  winston.debug('Registering user: ' + email + ' type: ' + type);
  // validate the inputs
  req.checkBody('firstname', 'Firstname is required').notEmpty();
  req.checkBody('lastname', 'Lastname is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('../views/register.pug', {
      errors: errors,
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: password,
      password2: password2,
      type: type
    });
  } else {
    // Create user object
    let user = new User('TBA', email, firstName, lastName, password, type);
    db.register(user)
      .then(result => {
        req.flash('success', 'You are registered, please log in.');
        res.redirect('/login');
      })
      .catch(error => {
        winston.debug(error.message);
        req.flash('danger', 'Email already exists, please try again.');
        res.render('../views/register.pug');
      });
  }
};

// Responds with a list of all users
exports.listAllUsers = function(req, res) {
  res.send('NOT IMPLEMENTD: userList');
};

// Responds with the details of user given an id
exports.listUser = function(req, res) {
  res.send('NOT IMPLEMENTD: listUser ' + req.param.id);
};

// Create single user with get method
exports.createUserGet = function(req, res) {
  res.send('NOT IMPLEMENTD: createUserGet');
};

// Create single user with post method
exports.createUserPost = function(req, res) {
  res.send('NOT IMPLEMENTD: createUserPost');
};

// Display user delete form on GET.
exports.deleteUserGet = function(req, res) {
  res.send('NOT IMPLEMENTED: user delete GET');
};

// Handle user delete on POST.
exports.deleteUserPost = function(req, res) {
  res.send('NOT IMPLEMENTED: user delete POST');
};

// Display user update form on GET.
exports.updateUserGet = function(req, res) {
  res.send('NOT IMPLEMENTED: user update GET');
};

// Handle user update on POST.
exports.updateUserPost = function(req, res) {
  res.send('NOT IMPLEMENTED: user update POST');
};

// db.connection.query("DELETE FROM user WHERE LastName = '111'", function(
//   err,
//   result,
//   fields
// ) {
//   if (err) throw err;
//   console.log('Number of records deleted: ' + result.affectedRows);
// });
// let user1 = new User('999', '1@1.ca', 'fn', 'ln', '111', 'teacher');
// console.log(user1.password);

// db.connection.query('TRUNCATE TABLE messages', function(err, result, fields) {
//   console.log(result);
// });