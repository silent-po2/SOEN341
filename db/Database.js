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
  login(email, password) {
    let query =
      "select * from user where Email='" +
      email +
      "' and Password=MD5('" +
      password +
      "');";
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        this.connection.connect();
      }
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (res.length === 0) reject(new Error('User not found'));
        else {
          let result = [
            res[0].Id,
            res[0].Email,
            res[0].FirstName,
            res[0].LastName,
            res[0].Password,
            'teacher'
          ];
          resolve(result);
        }
      });
    });
  }

  // This function inserts a new post to the database
  post(post) {
    let query = `insert into messages (Message) values ('${post}');`;
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
}

module.exports = new Database();
