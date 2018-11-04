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
    winston.info('GET home');
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
    winston.info('GET login');
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
    winston.info('POST login');

    let email = req.body.email.toLowerCase();
    let password = req.body.password;
    let type = req.body.userType;

    winston.debug('Login user: ' + email + ' type: ' + type);

    // Promise that resolves if login params are correct.
    let checkLoginParams = new Promise((resolve, reject) => {
      req.checkBody('email', 'Email is required').notEmpty();
      req.checkBody('email', 'Email is not valid').isEmail();
      req.checkBody('password', 'Password is required').notEmpty();
      let err = req.validationErrors();
      if (err) reject(new Error('Email or password not defined.'));
      resolve(null);
    });

    checkLoginParams
      .then(() => {
        return db.login(email, password, type);
      })
      .then(user => {
        req.session.user = user;
        req.flash('success', 'You are logged in.');
        return res.redirect('/profile');
      })
      .catch(error => {
        winston.error(error.stack);
        req.flash(
          'danger',
          'Email not found, password or user type incorrect, please try again.'
        );
        return res.status(401).render('../views/login.pug');
      });
  },

  /**
   * Function that responds to a '/logout' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  logout: function(req, res) {
    winston.info('GET logout');
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
    winston.info('GET profile');
    if (req.session.user) {
      let user = new User().create(req.session.user);
      let userArr = user.toArray();
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
          winston.error(error.stack);
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
    winston.info('GET register');
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
    winston.info('POST register');
    let email = req.body.email.toLowerCase();
    let firstName = req.body.firstname;
    let lastName = req.body.lastname;
    let password = req.body.password;
    let password2 = req.body.password2;
    let type = req.body.userType;
    winston.debug('Registering user: ' + email + ' type: ' + type);

    let checkRegisterParams = new Promise((resolve, reject) => {
      // validate the inputs
      req.checkBody('firstname', 'Firstname is required').notEmpty();
      req.checkBody('lastname', 'Lastname is required').notEmpty();
      req.checkBody('email', 'Email is required').notEmpty();
      req.checkBody('email', 'Email is not valid').isEmail();
      req.checkBody('password', 'Password is required').notEmpty();
      req.checkBody('password2', 'Passwords do not match').equals(password);
      let err = req.validationErrors();
      if (err)
        reject(
          new Error('Some parameters are not defined or passwords not equal.')
        );
      resolve();
    });

    checkRegisterParams
      .then(() => {
        return db.register({ email, firstName, lastName, password, type });
      })
      .then(result => {
        req.flash('success', 'You are registered, please log in.');
        res.redirect('/login');
      })
      .catch(error => {
        winston.debug(error.message);
        req.flash('danger', error.message);
        // TODO are we using these values to realaod the page with the already inputed values?
        res.status(401).render('../views/register.pug', {
          errors: error,
          email: email,
          firstName: firstName,
          lastName: lastName,
          password: password,
          password2: password2,
          type: type
        });
      });
  },
  /**
   * Function that responds to a '/contacts' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  contactsPost: function(req, res) {
    winston.info('POST contacts');
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
          winston.error(error.stack);
          req.flash('danger', 'Fail to form a group, please try again.');
          res.redirect('/contacts');
        });
      for (let i = 0; i < userArray.length; i++) {
        db.formGroup(gname, userArray[i])
          .then(result => {})
          .catch(error => {
            winston.error(error.stack);
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
    winston.info('GET contacts');
    if (req.session.user) {
      let user = new User().create(req.session.user);
      let userArr = user.toArray();
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
          winston.error(error.stack);
        });
    } else {
      res.redirect('/login');
    }
  }
};
