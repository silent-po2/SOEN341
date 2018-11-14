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
  getNotifications: function(req, res) {
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
          winston.error(error.stack);
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
  readNotifications: function(req, res) {
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
  groups: function(req, res) {
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
          db.getNotifications(user.id).then(res2 => {
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
          winston.error(error.stack);
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
  editProfile: function(req, res) {
    if (req.session.user) {
      db.getNotifications(user.id)
        .then(res2 => {
          let notif = JSON.parse('[' + res2 + ']');
          notif = notif[0] + notif[1] + notif[2];
          res.render('editprofile', {
            title: 'Edit Profile',
            user: req.session.user,
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
   * Function that responds to a '/register' POST request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  editProfilePost: function(req, res) {
    if (req.session.user) {
      let userBeforeChange = req.session.user;
      let id = userBeforeChange.id;
      let email = req.body.email.toLowerCase();
      let firstName = req.body.firstname;
      let lastName = req.body.lastname;
      let type = userBeforeChange.type;
      winston.debug('Registering user: ' + email + ' type: ' + type);
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
            return res.redirect('/profile');
          })
          .catch(error => {
            winston.debug(error.stack);
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
  resetPassword: function(req, res) {
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
        winston.debug(error.stack);
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
  contactsPost: function(req, res) {
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
              .then(result => {})
              .catch(error => {
                winston.error(error.stack);
                req.flash(
                  'danger',
                  'Fail to add a member to group, please try again.'
                );
                res.redirect('/contacts');
              });
          }
        })
        .catch(error => {
          winston.error(error.stack);
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
  contacts: function(req, res) {
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
                winston.error(error.stack);
              })
              .catch(error => {
                winston.error(error.stack);
              });
          })
          .catch(error => {
            winston.error(error.stack);
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
  handleRequest: function(req, res) {
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
            winston.error(error.stack);
          });
      } else {
        let requestId = req.body.RequestId;
        db.updateGourpRequest(requestId)
          .then(result => {
            req.flash('danger', 'Rejected.');
            res.redirect('contacts');
          })
          .catch(error => {
            winston.error(error.stack);
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
  search: function(req, res) {
    if (req.session.user) {
      let searchString = req.body.Search;
      let user = new User().create(req.session.user);
      let notif;
      db.getNotifications(user.id).then(res2 => {
        notif = JSON.parse('[' + res2 + ']');
        notif = notif[0] + notif[1] + notif[2];

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

                winston.debug('notif: ' + notif);
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
      });
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
  searchUser: function(req, res) {
    if (req.session.user) {
      let searchString = req.body.SearchUser;
      let user = new User().create(req.session.user);
      let userArr = user.toArray();
      let myId = user.id;
      let notif;
      db.loadUsers()
        .then(result => {
          db.getNotifications(user.id).then(res2 => {
            notif = JSON.parse('[' + res2 + ']');
            notif = notif[0] + notif[1] + notif[2];
          });
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
                      groupList: groupList,
                      notif: notif
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
                          searchResult: searchResult,
                          notif: notif
                        });
                      })
                      .catch(error => {
                        res.status(401).render('contacts');
                      });
                  }
                })
                .catch(error => {
                  winston.error(error.stack);
                });
            })
            .catch(error => {
              winston.error(error.stack);
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
  othersProfile: function(req, res) {
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
  addRequest: function(req, res) {
    let groupId = req.body.GroupId;
    let title = req.body.Title;
    let admin = req.body.Admin;
    let userId = req.body.UserId;
    db.addgroupRequest(groupId, userId, title, admin)
      .then(result => {
        let userArr = [];
        let groupArr = [];
        let user = req.session.user;
        let notif;
        db.getNotifications(user.id).then(res2 => {
          notif = JSON.parse('[' + res2 + ']');
          notif = notif[0] + notif[1] + notif[2];
          winston.debug('notif' + notif);
          req.flash('success', 'Request sent.');
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
  },

  /**
   * Function that responds to a '/adduser' get request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  adduserGet: function(req, res) {
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
          winston.error(error.stack);
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
  adduserPost: function(req, res) {
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
                winston.error(error.stack);
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
                    winston.error(error.stack);
                  });
              })
              .catch(error => {
                winston.error(error.stack);
              });
          }
        })
        .catch(error => {
          winston.error(error.stack);
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
  editProfile: function(req, res) {
    if (req.session.user) {
      res.render('editprofile', {
        title: 'Edit Profile',
        user: req.session.user
      });
    } else {
      res.render('login');
    }
  }
};
