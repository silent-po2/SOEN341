/*
  Module containing database functions for queries.
  Inspired by https://codeburst.io/node-js-mysql-and-promises-4c3be599909b
 */
const mysql = require("mysql");

class Db {
  // Constructor only creates connection but does not open it
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }

  // takes an SQL string and an optional array of args
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Closes the connection to the db
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  // Returns a promise with the user
  login(user, password) {
    let query =
      "select * from user where Email='" +
      user +
      "' and Password=MD5('" +
      password +
      "');";
    return new Promise((resolve, reject) => {
      this.query(query).then(rows => {
        if (rows.length === 0) reject(new Error("User not found"));
        // TODO maybe return user object?
        resolve();
      });
    });
  }
}

module.exports = Db;
