/**
 * This controller holds the responses that handle requests made by users.
 * Such as login, register, logout, view profile and view contacts.
 */

let User = require('../models/user');
let db = require('../db/Database');
let winston = require('../config/winston');

module.exports = {
  /**
   * Function that responds to a '/' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  userHome: function(req, res) {
    res.render('../views/home.pug', {
      user: req.session.user
    });
  },

  /**
   * Function that responds to a '/login' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  login: function(req, res) {
    res.render('../views/login.pug', {
      title: 'Login'
    });
  },

  /**
   * Function that responds to a '/login' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  loginPost: function(req, res) {
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
      res.status(401).res.render('../views/login.pug', {
        errors: errors
      });
    } else {
      // Else proceed with login verification
      db.login(email, password, type)
        .then(result => {
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
          res.redirect('/profile');
        })
        .catch(error => {
          winston.error(error);
          req.flash(
            'danger',
            'Email not found, password or user type incorrect, please try again.'
          );
          res.status(401).render('../views/login.pug');
        });
    }
  },

  /**
   * Function that responds to a '/logout' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  logout: function(req, res) {
    if (req.session.user) {
      req.session.destroy();
      res.redirect('/login');
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/profile' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  profile: function(req, res) {
    if (req.session.user) {
      let user = req.session.user;
      let userArr = [
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.type
      ];
      db.loadUsers()
        .then(result => {
          res.render('../views/profile.pug', {
            title: 'Profile',
            userArr: userArr,
            user: req.session.user,
            userList: result
          });
        })
        .catch(error => {
          winston.error(error);
        });
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/register' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  register: function(req, res) {
    res.render('../views/register.pug', {
      title: 'Register'
    });
  },

  /**
   * Function that responds to a '/register' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  registerPost: function(req, res) {
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
      let user = { email, firstName, lastName, password, type };
      db.register(user)
        .then(result => {
          req.flash('success', 'You are registered, please log in.');
          res.redirect('/login');
        })
        .catch(error => {
          winston.debug(error.message);
          req.flash('danger', 'Email already exists, please try again.');
          res.status(401).render('../views/register.pug');
        });
    }
  },
  /**
   * Function that responds to a '/contacts' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  contactsPost: function(req, res) {
    let myId = req.body.myId;
    let userArray = req.body.userId;
    let gname = req.body.groupName;
    winston.debug('title: ' + gname + 'users:' + myId + userArray);
    if (gname === '') {
      req.flash('danger', 'Please enter a name.');
      res.redirect('/contacts');
    } else if (!userArray) {
      req.flash('danger', 'Please select at least one contact.');
      res.redirect('/contacts');
    } else {
      db.formGroup(gname, myId)
        .then(result => {})
        .catch(error => {
          winston.error(error);
          req.flash('danger', 'Fail to form a group, please try again.');
          res.redirect('/contacts');
        });
      for (let i = 0; i < userArray.length; i++) {
        db.formGroup(gname, userArray[i])
          .then(result => {})
          .catch(error => {
            winston.error(error);
            req.flash('danger', 'Fail to form a group, please try again.');
            res.redirect('/contacts');
          });
      }
      req.flash('success', 'Group formed.');
      res.redirect('/contacts');
    }
  },
  /**
   * Function that responds to a '/contacts' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  contacts: function(req, res) {
    if (req.session.user) {
      let user = req.session.user;
      let userArr = [
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.type
      ];
      db.loadUsers()
        .then(result => {
          let userList = result;
          db.loadGroups(user.id).then(result => {
            res.render('../views/contacts.pug', {
              title: 'My Contact',
              userArr: userArr,
              user: req.session.user,
              userList: userList,
              groupList: result
            });
          });
        })
        .catch(error => {
          winston.error(error);
        });
    } else {
      res.redirect('/login');
    }
  }
};
