/**
 * This controller holds the responses that handle requests made by users to the dashboard.
 */

let db = require('../db/Database');
let winston = require('../config/winston');
let multer = require('multer');
let path = require('path');
let User = require('../models/user');

let storage = multer.diskStorage({
  /**
   * TODO
   *
   * @param {*} req
   * @param {*} file
   * @param {*} cb
   */
  destination: function(req, file, cb) {
    cb(null, './public/uploads/');
  },
  /**
   * TODO
   *
   * @param {*} req
   * @param {*} file
   * @param {*} cb
   */
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  }
});

/**
 * TODO
 *
 * @param {*} file
 * @param {*} cb
 * @return {cb}
 */
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
    /**
     * TODO
     *
     * @param {*} req
     * @param {*} file
     * @param {*} cb
     */
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
    }
  }),

  /**
   * Function that responds to a '/dashboard' GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  dashboard: function(req, res) {
    if (req.session.user) {
      let postArr = [];
      let user = new User().create(req.session.user);
      let userArr = user.toArray();
      db.getAllThreads()
        .then(rows => {
          for (let i = 0; i < rows.length; i++) {
            postArr[i] = rows[i];
          }
          res.render('../views/dashboard.pug', {
            postArr: postArr,
            userArr: userArr,
            user: req.session.user
          });
        })
        .catch(error => {
          winston.error(error.stack);
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
      db.addDashboardMsg(post, imageName, sender)
        .then(result => {
          // req.flash('success', 'Message posted');
          res.redirect('/dashboard');
        })
        .catch(error => {
          winston.error(error.stack);
          req.flash('danger', 'Fail to post a message, please try again.');
          res.status(401).redirect('/dashboard');
        });
    }
  },
  /**
   * Function that responds to a '/like' POST request
   *
   * @param {*} req
   * @param {*} res
   */
  like: function(req, res) {
    let msgId = req.body.msgId;
    winston.debug(msgId);
    db.like(msgId)
      .then(result => {
        let likes = result;
        let postArr = [];
        let user = new User().create(req.session.user);
        let userArr = user.toArray();
        db.getAllThreads()
          .then(rows => {
            for (let i = 0; i < rows.length; i++) {
              postArr[i] = rows[i];
            }
            winston.debug(postArr);
            res.render('../views/dashboard.pug', {
              postArr: postArr,
              userArr: userArr,
              likes: likes,
              user: req.session.user
            });
          })
          .catch(error => {
            winston.error(error.stack);
            req.flash('danger', 'Fail to load messages, please try again.');
            res.redirect('/dashboard');
          });
      })
      .catch(error => {
        winston.error(error.stack);
        req.flash('danger', 'Fail to load messages, please try again.');
        res.redirect('/dashboard');
      });
  }
};
