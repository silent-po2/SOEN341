/**
 * This controller holds the responses that handle requests made by users.
 * Such as login, register, logout, view profile and view contacts.
 */

let User = require('../models/user');
let db = require('../db/Database');
let winston = require('../config/winston');
const nodemailer = require('nodemailer');


module.exports = {
  /**
   * Function that responds to a '/' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  userHome: function (req, res) {
    winston.info('GET home');
    if (req.session.user) {
      let user = new User().create(req.session.user);
      db.getNotifications(user.id).then(res2 => {
        let notif = JSON.parse('[' + res2 + ']');
        notif = notif[0] + notif[1] + notif[2];
        res.render('../views/home.pug', {
          user: req.session.user,
          notif: notif
        });
      });
    } else {
      res.render('../views/home.pug', {
        user: req.session.user
      });
    }
  },

  /**
   * Function that responds to a '/notifications' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  getNotifications: function (req, res) {
    winston.info('GET notifications');
    if (req.session.user) {
      let user = new User().create(req.session.user);
      db.getNotifications(user.id)
        .then(result => {
          let notif = JSON.parse('[' + result + ']');
          notif = notif[0] + notif[1] + notif[2];
          return res.render('../views/notification.pug', {
            user: req.session.user,
            notifications: result,
            notif: notif
          });
        })
        .catch(error => {
          winston.error(error.message);
        });
    } else {
      res.render('../views/home.pug', {
        user: req.session.user
      });
    }
  },

  /**
   * Function that responds to a '/notifications' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  readNotifications: function (req, res) {
    let user = new User().create(req.session.user);
    winston.info('GET notifications');
    db.removeNotifications(user.id).then(result => {
      res.render('../views/notification.pug', {
        user: req.session.user,
        notifications: [0, 0, 0]
      });
    });
  },
  /**
   * Function that responds to a '/groups' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  groups: function (req, res) {
    res.render('../views/groups.pug', {
      user: req.session.user
    });
  },
  /**
   * Function that responds to a '/login' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  login: function (req, res) {
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
  loginPost: function (req, res) {
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
        winston.error(error.message);
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
  logout: function (req, res) {
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
  profile: function (req, res) {
    winston.info('GET profile');
    if (req.session.user) {
      let user = new User().create(req.session.user);
      let userArr = user.toArray();
      db.loadUsers()
        .then(result => {
          return db.getNotifications(user.id).then(res2 => {
            let notif = JSON.parse('[' + res2 + ']');
            notif = notif[0] + notif[1] + notif[2];
            res.render('../views/profile.pug', {
              title: 'Profile',
              userArr: userArr,
              user: req.session.user,
              userList: result,
              notif: notif
            });
          });
        })
        .catch(error => {
          winston.error(error.message);
        });
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/register' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  editProfilePost: function (req, res) {
    if (req.session.user) {
      let userBeforeChange = req.session.user;
      let id = userBeforeChange.id;
      let email = req.body.email.toLowerCase();
      let firstName = req.body.firstname;
      let lastName = req.body.lastname;
      let type = userBeforeChange.type;
      winston.debug('Editing profile user: ' + email + ' type: ' + type);
      // validate the inputs
      req.checkBody('firstname', 'Firstname is required').notEmpty();
      req.checkBody('lastname', 'Lastname is required').notEmpty();
      req.checkBody('email', 'Email is required').notEmpty();
      let errors = req.validationErrors();

      if (errors) {
        let user = { id, email, firstName, lastName, type };
        res.render('editprofile', {
          errors: errors,
          email: email,
          firstName: firstName,
          lastName: lastName,
          user: user
        });
      } else {
        // Create user object

        let user = { id, email, firstName, lastName, type };
        db.editProfile(user)
          .then(result => {
            req.flash('success', 'Proile changed.');
            req.session.user = user;
            res.redirect('/profile');
          })
          .catch(error => {
            winston.error(error.message);
            req.flash('danger', 'Email already exists, please try again.');
            res.status(401).render('../views/editprofile.pug');
          });
      }
    } else {
      res.render('login');
    }
  },

  /**
   * Function that handles a POST call to reset a password.
   *
   * @param {*} req
   * @param {*} res
   */
  resetPassword: function (req, res) {
    let user = new User().create(req.session.user);
    // TODO add newPassword2 check to make sure new password is enterered twice the right way
    // TODO do a checkbody on it newPassword and newPassowrd2
    db.changePassword(user, req.body.oldPassword, req.body.newPassword)
      .then(result => {
        req.flash('success', 'Password reset.');
        // User should login with new password once it is changed
        res.redirect('/logout');
      })
      .catch(error => {
        winston.debug(error.message);
        req.flash('danger', 'Email already exists, please try again.');
        // TODO Not sure if we need to change the page to a password reset page yet
        res.status(401).render('../views/editprofile.pug');
      });
  },

  /**
   * Function that responds to a '/register' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  register: function (req, res) {
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
  registerPost: function (req, res) {
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
        // TODO are we using these values to reload the page with the already inputed values?
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
  contactsPost: function (req, res) {
    winston.info('POST contacts');
    let user = new User().create(req.session.user);
    let userArray = req.body.userId;
    let gname = req.body.groupName;
    winston.debug('title: ' + gname + 'users:' + user.id + userArray);
    if (gname === '') {
      req.flash('danger', 'Please enter a name.');
      res.redirect('/contacts');
    } else if (!userArray) {
      req.flash('danger', 'Please select at least one contact.');
      res.redirect('/contacts');
    } else {
      db.formGroup(gname, user.id)
        .then(result => {
          let obj = Object.values(result);
          let groupId = Object.values(Object.values(obj[1])[0]);
          winston.debug('groupId: ' + groupId);
          userArray.push(user.id);
          for (let i = 0; i < userArray.length; i++) {
            db.addGroupMember(groupId, gname, userArray[i])
              .then(result => { })
              .catch(error => {
                winston.error(error.message);
                req.flash(
                  'danger',
                  'Fail to add a member to group, please try again.'
                );
                res.redirect('/contacts');
              });
          }
        })
        .catch(error => {
          winston.error(error.message);
          req.flash('danger', 'Fail to form a group, please try again.');
          res.redirect('/contacts');
        });
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
  contacts: function (req, res) {
    winston.info('GET contacts');
    if (req.session.user) {
      let user = new User().create(req.session.user);
      let userArr = user.toArray();
      let myId = user.id;
      db.loadUsers().then(result => {
        let userList = result;
        db.loadGroups(user.id)
          .then(result => {
            let groupList = result;
            db.loadRequest(myId)
              .then(result => {
                let requestList = result;
                db.getNotifications(user.id).then(res2 => {
                  let notif = JSON.parse('[' + res2 + ']');
                  notif = notif[0] + notif[1] + notif[2];
                  res.render('../views/contacts.pug', {
                    userArr: userArr,
                    requestList: requestList,
                    user: req.session.user,
                    userList: userList,
                    groupList: groupList,
                    notif: notif
                  });
                });
              })
              .catch(error => {
                winston.error(error.message);
              })
              .catch(error => {
                winston.error(error.message);
              });
          })
          .catch(error => {
            winston.error(error.message);
          });
      });
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/request' post request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  handleRequest: function (req, res) {
    if (req.session.user) {
      let handler = req.body.handler;
      if (handler == 'Accept') {
        let userId = req.body.UserId;
        let title = req.body.Title;
        let groupId = req.body.GroupId;
        let requestId = req.body.RequestId;
        db.addGroupMember(groupId, title, userId)
          .then(result => {
            db.updateGourpRequest(requestId);
            req.flash('success', 'Accepted.');
            res.redirect('contacts');
          })
          .catch(error => {
            winston.error(error.message);
          });
      } else {
        let requestId = req.body.RequestId;
        db.updateGourpRequest(requestId)
          .then(result => {
            req.flash('danger', 'Rejected.');
            res.redirect('contacts');
          })
          .catch(error => {
            winston.error(error.message);
          });
      }
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/search' post request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  search: function (req, res) {
    if (req.session.user) {
      let searchString = req.body.Search;
      let user = new User().create(req.session.user);
      let notif;
      db.getNotifications(user.id).then(res2 => {
        notif = JSON.parse('[' + res2 + ']');
        notif = notif[0] + notif[1] + notif[2];
      });
      req.checkBody('Search', 'Search is empty').notEmpty();
      let errors = req.validationErrors();
      if (errors) {
        let userArr = [];
        let groupArr = [];
        res.render('search', {
          errors: errors,
          userArr: userArr,
          groupArr: groupArr,
          user: user,
          notif: notif
        });
      } else {
        db.searchUser(searchString)
          .then(result => {
            let userArr = result;
            db.searchGroup(searchString).then(result => {
              let groupArr = result;

              res.render('search', {
                userArr: userArr,
                groupArr: groupArr,
                user: user,
                notif: notif
              });
            });
          })
          .catch(error => {
            res.status(401).render('../views/search.pug');
          });
      }
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/searchuser' post request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  searchUser: function (req, res) {
    if (req.session.user) {
      let searchString = req.body.SearchUser;
      let user = new User().create(req.session.user);
      let userArr = user.toArray();
      let myId = user.id;
      db.loadUsers()
        .then(result => {
          let userList = result;
          db.loadGroups(user.id)
            .then(result => {
              let groupList = result;
              db.loadRequest(myId)
                .then(result => {
                  let requestList = result;
                  req.checkBody('SearchUser', 'Search is empty').notEmpty();
                  let errors = req.validationErrors();
                  if (errors) {
                    res.render('contacts', {
                      errors: errors,
                      userArr: userArr,
                      requestList: requestList,
                      user: req.session.user,
                      userList: userList,
                      groupList: groupList
                    });
                  } else {
                    db.searchUser(searchString)
                      .then(result => {
                        let searchResult = result;
                        res.render('contacts', {
                          errors: errors,
                          userArr: userArr,
                          requestList: requestList,
                          user: req.session.user,
                          userList: userList,
                          groupList: groupList,
                          searchResult: searchResult
                        });
                      })
                      .catch(error => {
                        res.status(401).render('contacts');
                      });
                  }
                })
                .catch(error => {
                  winston.error(error.message);
                });
            })
            .catch(error => {
              winston.error(error.message);
            });
        })
        .catch(error => {
          winston.error(error.message);
        });
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/search' get request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  // searchGet: function(req, res) {
  //   winston.info('GET search');
  //   res.render('../views/search.pug', {
  //     serArr: userArr,
  //     groupArr: groupArr,
  //     user: user
  //   });
  // },

  /**
   * Function that responds to a '/profiles/:id' post request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  othersProfile: function (req, res) {
    let firstName = req.body.FirstName;
    let lastName = req.body.LastName;
    let email = req.body.Email;
    let type = req.body.Type;
    let userId = req.body.UserId;

    res.render('profiles', {
      firstName: firstName,
      lastName: lastName,
      email: email,
      type: type,
      userId: userId,
      user: req.session.user
    });
  },

  /**
   * Function that responds to a '/addgroup/:id' post request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  addRequest: function (req, res) {
    let groupId = req.body.GroupId;
    let title = req.body.Title;
    let admin = req.body.Admin;
    let userId = req.body.UserId;
    db.addgroupRequest(groupId, userId, title, admin)
      .then(result => {
        let userArr = [];
        let groupArr = [];
        let user = req.session.user;
        req.flash('success', 'Request sent.');
        res.render('search', {
          userArr: userArr,
          groupArr: groupArr,
          user: user
        });
      })
      .catch(error => {
        res.status(401).render('../views/search.pug');
      });
  },

  /**
   * Function that responds to a '/adduser' get request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  adduserGet: function (req, res) {
    if (req.session.user) {
      let user = new User().create(req.session.user);
      let tobeAdded = req.params.id;
      winston.info(tobeAdded);
      db.loadAdminGroup(user.id)

        .then(result => {
          let myGroup = result;
          res.render('adduser', {
            myGroup: myGroup,
            tobeAdded: tobeAdded,
            user: req.session.user
          });
        })
        .catch(error => {
          winston.error(error.message);
        });
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/adduser' post request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  adduserPost: function (req, res) {
    winston.info('POST adduser');
    if (req.session.user) {
      let tobeAdded = req.body.UserId;
      let groupId = req.body.GroupId;
      let title = req.body.Title;
      let user = new User().create(req.session.user);
      db.isIntheGroup(groupId, tobeAdded)
        .then(rows => {
          if (rows != '') {
            db.loadAdminGroup(user.id)
              .then(result => {
                let myGroup = result;
                req.flash('danger', 'This user is already a group member');
                res.render('adduser', {
                  myGroup: myGroup,
                  tobeAdded: tobeAdded,
                  user: req.session.user
                });
              })
              .catch(error => {
                winston.error(error.message);
              });
          } else {
            db.addGroupMember(groupId, title, tobeAdded)
              .then(result => {
                db.loadAdminGroup(user.id)
                  .then(result => {
                    let myGroup = result;
                    req.flash('success', 'Added');
                    res.render('adduser', {
                      myGroup: myGroup,
                      tobeAdded: tobeAdded,
                      user: req.session.user
                    });
                  })
                  .catch(error => {
                    winston.error(error.message);
                  });
              })
              .catch(error => {
                winston.error(error.message);
              });
          }
        })
        .catch(error => {
          winston.error(error.message);
        });
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Function that responds to a '/editprofile' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  editProfile: function (req, res) {
    if (req.session.user) {
      res.render('editprofile', {
        title: 'Edit Profile',
        user: req.session.user
      });
    } else {
      res.render('login');
    }
  },

  /**
   * Function that responds to a '/passwordreset' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  passwordReset: function (req, res) {
    let user = new User().create(req.session.user);
    if (req.session.user) {
      db.getNotifications(user.id)
        .then(res2 => {
          let notif = JSON.parse('[' + res2 + ']');
          notif = notif[0] + notif[1] + notif[2];
          res.render('passwordreset', {
            user: user,
            notif: notif
          });
        })
        .catch(error => {
          winston.error(error.stack);
        });
    } else {
      res.render('login');
    }
  },

  /**
   * Function that responds to a '/passwordreset' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  passwordResetPost: function (req, res) {
    if (req.session.user) {
      let user = new User().create(req.session.user);
      let oldP = req.body.oldPassword;
      let newP = req.body.newPassword;
      let newP2 = req.body.repeatPassword;

      winston.debug(
        ' old password: ' +
        oldP +
        ' new password: ' +
        newP +
        ' new password2: ' +
        newP2
      );
      // validate the inputs
      req.checkBody('oldPassword', 'Old password is required').notEmpty();
      req.checkBody('newPassword', 'New password is required').notEmpty();
      req.checkBody('repeatPassword', 'Please repeated').notEmpty();
      req.checkBody('repeatPassword', 'Passwords do not match').equals(newP);
      let errors = req.validationErrors();

      if (errors) {
        db.getNotifications(user.id).then(res2 => {
          let notif = JSON.parse('[' + res2 + ']');
          notif = notif[0] + notif[1] + notif[2];
          res.render('passwordreset', {
            errors: errors,
            user: user,
            notif: notif
          });
        });
      } else {
        // Create user object

        db.changePassword(user, oldP, newP)
          .then(result => {
            req.flash('success', 'Password changed.');
            req.session.user = user;
            return res.redirect('/logout');
          })
          .catch(error => {
            winston.debug(error.stack);
            req.flash('danger', 'Fail to change password, please try again.');
            res.status(401).render('../views/editprofile.pug');
          });
      }
    } else {
      res.render('login');
    }
  },

  /**
   * Function that responds to a '/passwordforgot' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */

  passwordForgot: function (req, res) {
    winston.info('GET passwordforgot');
    res.render('../views/passwordforgot.pug', {
      title: 'Forgot Password'
    });
  },

  /**
   * Function that responds to a '/passwordforgot' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  passwordForgotPost: function (req, res) {

    let email = req.body.email;

    winston.debug('User email: ' + email);

    // Promise that resolves if email params are correct.
    let verifyEmail = new Promise((resolve, reject) => {
      req.checkBody('email', 'Email is required').notEmpty();
      req.checkBody('email', 'Email is not valid').isEmail();
      let err = req.validationErrors();
      if (err) reject(new Error('Email not found.'));
      resolve(null);
    });
    verifyEmail
      .then(() => {
        return db.confirmEmail(email);
      })
      .then(result => {
        req.flash('success', 'An email reset link was sent to');

        nodemailer.createTestAccount((err, account) => {
          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: account.user, // generated ethereal user
              pass: account.pass // generated ethereal password
            }
          });

          // setup email data with unicode symbols
          let mailOptions = {
            from: '"Kiwi Application" <multanitanya786@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'Password Reset', // Subject line
            //text: 'Hello world?', // plain text body
            html: '<b><a href="http://localhost:3000/passwordforgotredirect/' + email + '"> Click here to reset password. </a></b>' // html body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          });
        });

        return res.redirect('/passwordforgot');
      })
      .catch(error => {
        winston.error(error.message);
        req.flash('danger', 'No account with that email address exists.');
        return res.status(401).render('../views/passwordforgot.pug');
      });

  },
  /**
   * Function that responds to a '/passwordforgotredirect' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  passwordForgotRedirect: function (req, res) {
    winston.info('GET passwordforgotredirect');
    res.render('../views/passwordforgotredirect.pug', {
      title: 'forgot password'
    });
  },

  /**
   * Function that responds to a '/passwordforgotredirect' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  passwordForgotRedirectPost: function (req, res) {
    let email = req.originalUrl.substring(req.originalUrl.indexOf("passwordforgotredirect/") + 23);
    //let email = "tm@gmail.com"
    let newP = req.body.newPassword;
    let newP2 = req.body.repeatPassword;

    winston.debug('email: ' + email + ' new password: ' + newP + ' new password2: ' + newP2);
    // validate the inputs
    req.checkBody('newPassword', 'New password is required').notEmpty();
    req.checkBody('repeatPassword', 'Please repeat').notEmpty();
    req.checkBody('repeatPassword', 'Passwords do not match').equals(newP);
    let errors = req.validationErrors();
    if (errors) {
      reject(
        new Error('Some parameters are not defined or passwords not equal.')
      );
      resolve();
    } else {
      db.forgotPassword(email, newP)
        .then(result => {
          req.flash('success', 'Password changed.');
          return res.redirect('/login');
        })
        .catch(error => {
          winston.debug(error.stack);
          req.flash('danger', 'Fail to change password, please try again.');
          res.status(401).render('../views/passwordforgotredirect.pug');
        });
    }
  }
};
