/**
 * This controller holds the responses that handle requests made by users in the chat.
 */

let db = require('../db/Database');
let winston = require('../config/winston');
let moment = require('moment');

module.exports = {
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
          winston.error(error.stack);
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
          winston.error(error.stack);
        });
        db.receiveChat(sid, rid)
          .then(result => {
            res.render('chat', {
              chatList: result,
              receiver: rid
            });
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
   * Function that responds to a GOURPCHAT GET request
   *
   * @param {Object} req - Request parameter
   * @param {Object} res - Response parameter
   */
  groupchat: function(req, res) {
    if (req.session.user) {
      let user = req.session.user;
      let groupId = req.params.id;
      let sid = user.id;
      db.receivegroupChat(groupId)
        .then(result => {
          res.render('groupchat', {
            groupchatList: result,
            id: groupId,
            sender: sid
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
   * TODO
   *
   * @param {*} req
   * @param {*} res
   */
  groupchatPost: function(req, res) {
    if (req.session.user) {
      let chat = req.body.groupchat;
      req.checkBody('groupchat', 'Message is empty').notEmpty();
      let errors = req.validationErrors();
      if (errors) {
        let user = req.session.user;
        let groupId = req.params.id;
        let sid = user.id;
        db.receivegroupChat(groupId).then(result => {
          res.render('groupchat', {
            errors: errors,
            groupchatList: result,
            title: title,
            sender: sid
          });
        });
      } else {
        let user = req.session.user;
        let groupId = req.params.id;
        let sid = user.id;
        winston.debug('Sending: ' + chat + 'to id: ' + req.params.id);
        db.sendGroupChat(groupId, sid, chat).catch(error => {
          winston.error(error.stack);
        });
        db.receivegroupChat(groupId)
          .then(result => {
            res.render('groupchat', {
              groupchatList: result,
              id: groupId,
              sender: sid
            });
          })
          .catch(error => {
            winston.error(error.stack);
          });
      }
    } else {
      res.redirect('/login');
    }
  }
};
