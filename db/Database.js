/*
  Module containing database functions for queries.
  Inspired by https://codeburst.io/node-js-mysql-and-promises-4c3be599909b
 */
const mysql = require('mysql');
let winston = require('../config/winston');

class Database {
  // Constructor only creates connection but does not open it
  constructor() {
    winston.debug('Db instantiated');
    this.connection = mysql.createConnection({
      host: '35.221.26.86',
      database: 'kiwidb',
      user: 'root',
      password: 'soen341'
    });
  }

  // Closes the connection to the db
  close() {
    this.connection.end(err => {
      if (err) throw err;
      winston.debug('db closed');
    });
  }

  // Returns a promise with the user id if user is found, rejects otherwise
  login(email, password, type) {
    let query =
      "select * from user where Email='" +
      email +
      "' and Password=MD5('" +
      password +
      "') and Type='" +
      type +
      "';";
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        this.connection.connect();
      }
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (res.length === 0 || err) reject(new Error('User not found'));
        else {
          let result = [
            res[0].Id,
            res[0].Email,
            res[0].FirstName,
            res[0].LastName,
            res[0].Password,
            res[0].Type
          ];
          resolve(result);
        }
      });
    });
  }

  // This function inserts a new post to the database
  post(post, imageName, sender) {
    let query =
      "insert into messages(Message, ImageName, Sender) values ('" +
      post +
      "', '" +
      imageName +
      "', '" +
      sender +
      "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  // This function selects all data from message table
  dashboardGet() {
    let query = 'SELECT * FROM messages';
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) {
          reject(err);
        } else resolve(res);
      });
    });
  }

  // This function inserts a new user into the database and subsequently into the teacher or parent tables
  register(user) {
    // Setup query
    let query =
      "insert into user (Email, FirstName, LastName, Password, Type) values ('" +
      user.email +
      "', '" +
      user.firstName +
      "', '" +
      user.lastName +
      "', MD5('" +
      user.password +
      "'), '" +
      user.type +
      "');";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) {
          reject(err);
        } else resolve(res);
      });
    });
  }

  // Returns the user id given a user object
  getId(email) {
    let query = "select Id from user where Email='" + email + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, rows) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        else resolve(rows[0].Id);
      });
    });
  }

  // loads all users' info
  loadUsers() {
    let query = 'select Id, FirstName, LastName from user';
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (res.length === 0) reject(new Error('User not found'));
        else {
          let result = [];
          for (let i = 0; i < res.length; i++) {
            result.push([res[i].Id, res[i].FirstName, res[i].LastName]);
          }
          resolve(result);
        }
      });
    });
  }
  // inserts the chat into tempchats table
  sendChat(rid, sid, time, chat) {
    let query =
      "insert into chat (Msg, `From`, `To`) values ('" +
      chat +
      "','" +
      sid +
      "','" +
      rid +
      "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  // select the chat for the receiver
  receiveChat(rid, sid) {
    let query =
      "select * from chat where (`To`='" +
      rid +
      "' and `From`='" +
      sid +
      "') or (`To`='" +
      sid +
      "' and `From`='" +
      rid +
      "') ";
    // "select * from tempchats where Rid='" + rid + "' and Sid='" + sid + "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (res.length === 0) {
          let result = [];
          resolve(result);
        } else {
          let result = [];
          for (let i = 0; i < res.length; i++) {
            result.push([res[i].Msg, res[i].To, res[i].From, res[i].DT]);
          }
          resolve(result);
        }
      });
    });
  }

  // loads all user's groups
  loadGroups(myId) {
    let query = "select title from groups where UserId='" + myId + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        let result = [];
        for (let i = 0; i < res.length; i++) {
          result.push(res[i].title);
        }
        resolve(result);
      });
    });
  }

  formGroup(title, userId) {
    // Setup query
    let query =
      "insert into groups (userId, title) values ('" +
      userId +
      "', '" +
      title +
      "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) {
          reject(err);
        } else resolve(res);
      });
    });
  }

  // inserts the group chat into group table
  sendGroupChat(groupId, title, sid, time, chat) {
    let query =
      "insert into GroupChat (GroupMsg, `From`, GroupId, title) values ('" +
      chat +
      "','" +
      sid +
      "','" +
      groupId +
      "','" +
      title +
      "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  // select the group chat for the group
  receivegroupChat(title) {
    let query = "select * from GroupChat where title='" + title + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (res.length === 0) {
          let result = [];
          resolve(result);
        } else {
          let result = [];
          for (let i = 0; i < res.length; i++) {
            result.push([
              res[i].GroupMsg,
              res[i].title,
              res[i].From,
              res[i].DT
            ]);
          }
          resolve(result);
        }
      });
    });
  }

  like(msgId) {
    let query =
      "UPDATE messages SET Like = Like + 1 where MsgId='" + msgId + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        let likes;
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        let query = "select Like from messages where MsgId='" + msgId + "';";
        this.connection.query(query, (err, res) => {
          if (err) throw err;
          else {
            likes = res;
            resolve(likes);
          }
        });
      });
    });
  }
}
module.exports = new Database();
