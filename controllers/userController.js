/**
 * This controller holds the responses that handle requests made to users.
 */

let User = require('../models/user');
let db = require('../db/Database');
let winston = require('../config/winston');

// Responds with user home page
exports.userHome = function(req, res) {
  res.render('../views/home.pug');
};

// Responds with login
exports.login = function(req, res) {
  res.render('../views/login.pug');
};

// Responds with register
exports.register = function(req, res) {
  res.render('../views/register.pug');
};

// Responds with login as teacher
exports.loginTeacherGet = function(req, res) {
  req.session.userType = 'teacher';
  res.render('../views/teacherLogin.pug');
};

// Responds with login as parent
exports.loginParentGet = function(req, res) {
  req.session.userType = 'parent';
  res.render('../views/parentLogin.pug');
};

// Verifies login information and redirects to user profile
exports.loginPost = function(req, res) {
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  let errors = req.validationErrors();

  // If inputs are not valid, render the page again
  if (errors) {
    res.render('teacherLogin', {
      errors: errors
    });
  } else {
    // Else proceed with login verification
    db.login(email, password)
      .then(id => {
        // Save user ID in session
        req.session.userId = id;
        db.close();
      })
      .then(() => {
        console.log('db closed \n user id:' + req.session.userId);
        return res.redirect('../views/dashboard.pug');
      })
      .catch(err => {
        req.flash(err);
      });
  }
};

// Responds with register as parent
exports.registerParentGet = function(req, res) {
  req.session.userType = 'parent';
  res.render('../views/parentRegister.pug');
};

// Responds with register as teacher
exports.registerTeacherGet = function(req, res) {
  req.session.userType = 'teacher';
  res.render('../views/teacherRegister.pug');
};

// Performs the register action once values are validated
exports.registerPost = function(req, res) {
  let email = req.body.email.toLowerCase();
  let firstName = req.body.firstname;
  let lastName = req.body.lastname;
  let password = req.body.password;
  let type = req.session.userType;

  winston.debug('Registering user: ' + email + ' type:' + type);

  // validate the inputs
  req.checkBody('firstname', 'Firstname is required').notEmpty();
  req.checkBody('lastname', 'Lastname is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('parentregister', { errors: errors });
  } else {
    // Create user object
    let user = new User(email, firstName, lastName, password, type);

    db.register(user)
      .then(() => {
        winston.debug('User added to db');
        req.flash('Success', 'You are registered, please log in.');
        db.close();
      })
      .then(res.render('login'))
      .catch(err => {
        winston.error(err);
        req.flash(err);
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
