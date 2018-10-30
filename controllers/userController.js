/**
 * This controller holds the responses that handle requests made by users.
 */

let User = require('../models/user');
let db = require('../db/Database');
let winston = require('../config/winston');
let moment = require('moment');

module.exports = {
  /**
   * Function that responds to a '/' GET request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
   */
  userHome: function(req, res) {
    res.render('../views/home.pug', {
      user: req.session.user
    });
  },

  /**
   * Function that responds to a '/login' GET request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
   */
  login: function(req, res) {
    res.render('../views/login.pug', {
      title: 'Login'
    });
  },

  /**
   * Function that responds to a '/login' POST request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
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
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
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
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
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
   * Function that responds to a '/chat/:id' GET request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
   */
  chat: function(req, res) {
    if (req.session.user) {
      let user = req.session.user;
      let rid = req.params.id;
      let sid = user.id;
      db.receiveChat(sid, rid)
        .then(result => {
          winston.debug(result);
          winston.debug(rid);
          res.render('chat', {
            chatList: result,
            receiver: rid
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
   * Function that responds to a '/chat/:id' POST request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
   */
  chatPost: function(req, res) {
    if (req.session.user) {
      let chat = req.body.chat;
      req.checkBody('chat', 'Message is empty').notEmpty();
      let errors = req.validationErrors();
      if (errors) {
        let user = req.session.user;
        let rid = req.params.id;
        let sid = user.id;
        db.receiveChat(sid, rid).then(result => {
          res.render('chat', {
            errors: errors,
            chatList: result,
            receiver: rid
          });
        });
      } else {
        winston.debug('Sending: ' + chat);
        let user = req.session.user;
        let rid = req.params.id;
        let sid = user.id;
        let time = moment.utc(new Date()).format('YYYY-MM-DD HH:mm:ss');
        db.sendChat(rid, sid, time, chat).catch(error => {
          winston.error(error);
        });
        db.receiveChat(sid, rid)
          .then(result => {
            res.render('chat', {
              chatList: result,
              receiver: rid
            });
          })
          .catch(error => {
            winston.error(error);
          });
      }
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/register' GET request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
   */
  register: function(req, res) {
    res.render('../views/register.pug', {
      title: 'Register'
    });
  },

  /**
   * Function that responds to a '/register' POST request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
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
      let user = new User('TBA', email, firstName, lastName, password, type);
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
   * Function that responds to a '/dashboard' GET request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
   */
  dashboard: function(req, res) {
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
          winston.error(error);
          req.flash('danger', 'Fail to load messages, please try again.');
          res.redirect('/dashboard');
        });
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/dashboard' POST request
   *
   * @param {Object} req - Request paramter
   * @param {Object} res - Response paramter
   */
  dashboardPost: function(req, res) {
    let post = req.body.post;
    winston.debug('Posting: ' + post);
    if (post == '') {
      req.flash('danger', 'Fail to post a message, please try again.');
      res.status(401).redirect('/dashboard');
    } else {
      db.post(post)
        .then(result => {
          // req.flash('success', 'Message posted');
          res.redirect('/dashboard');
        })
        .catch(error => {
          winston.error(error);
          req.flash('danger', 'Fail to post a message, please try again.');
          res.status(401).redirect('/dashboard');
        });
    }
  }
};
