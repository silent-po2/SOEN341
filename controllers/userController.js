/**
 * This controller holds the responses that handle requests made by users.
 */

let User = require('../models/user');
let db = require('../db/Database');
let winston = require('../config/winston');
let moment = require('moment');
let multer = require('multer');
let path = require('path');
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  }
});
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}
module.exports = {
  /**
   * Function that upload file
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  upload: multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
    }
  }),

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
   * Function that responds to a '/chat/:id' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
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
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
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
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  dashboard: function(req, res) {
    if (req.session.user) {
      let postArr = [];
      let user = req.session.user;
      let userArr = [
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.type
      ];
      db.dashboardGet()
        .then(rows => {
          for (let i = 0; i < rows.length; i++) {
            postArr[i] = rows[i].Message;
          }
          res.render('../views/dashboard.pug', {
            postArr: postArr,
            userArr: userArr,
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
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  dashboardPost: function(req, res) {
    let user = req.session.user;
    let sender = user.firstName + ' ' + user.lastName;
    let post = req.body.post;
    let image = req.file;
    let imageName;
    let msgId = req.body.msgId;
    winston.debug('msgId: ' + msgId);
    if (post == '') {
      req.flash('danger', 'Fail to post a message, please try again.');
      res.status(401).redirect('/dashboard');
    } else {
      if (image == undefined) {
        imageName = null;
      } else {
        imageName = req.file.filename;
      }
      db.post(post, imageName, sender)
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
  },
  /**
   * Function that responds to a GOURPCHAT GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  groupchat: function(req, res) {
    if (req.session.user) {
      let user = req.session.user;
      let title = req.params.title;
      let sid = user.id;
      db.receivegroupChat(title)
        .then(result => {
          res.render('groupchat', {
            groupchatList: result,
            title: title,
            sender: sid
          });
        })
        .catch(error => {
          winston.error(error);
        });
    } else {
      res.redirect('/login');
    }
  },

  groupchatPost: function(req, res) {
    if (req.session.user) {
      let chat = req.body.groupchat;
      req.checkBody('groupchat', 'Message is empty').notEmpty();
      let errors = req.validationErrors();
      if (errors) {
        let user = req.session.user;
        let title = req.params.title;
        let sid = user.id;
        db.receivegroupChat(title).then(result => {
          res.render('groupchat', {
            errors: errors,
            groupchatList: result,
            title: title,
            sender: sid
          });
        });
      } else {
        winston.debug('Sending: ' + chat);
        let user = req.session.user;
        let groupId = 1;
        let title = req.params.title;
        let sid = user.id;
        let time = moment.utc(new Date()).format('YYYY-MM-DD HH:mm:ss');
        db.sendGroupChat(groupId, title, sid, time, chat).catch(error => {
          winston.error(error);
        });
        db.receivegroupChat(title)
          .then(result => {
            res.render('groupchat', {
              groupchatList: result,
              title: title,
              sender: sid
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

  like: function(req, res) {
    let msgId = req.body.msgId;
    console.log(msgId);
    db.like(msgId);
    res.render('dashboard'),
      {
        likes: likes
      };
  }
};
