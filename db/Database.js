const mysql = require('mysql');
let winston = require('../config/winston');
let User = require('../models/user');

/**
 * Class that handles all calls to the database object
 * which is instantiated only once.
 *
 * @class Database
 */
class Database {
  /**
   * Creates an instance of Database.
   * @memberof Database
   */
  constructor() {
    winston.debug('Db instantiated');
    this.connection = mysql.createConnection({
      host: '35.221.26.86',
      database: 'kiwidb',
      user: 'root',
      password: 'soen341',
      multipleStatements: true
    });
  }

  /**
   * Closes the connection to the db
   *
   * @memberof Database
   */
  close() {
    this.connection.end(err => {
      if (err) throw err;
      winston.debug('db closed');
    });
  }

  /**
   * Returns a promise with the user id if user is found, rejects otherwise
   *
   * @param {*} email
   * @param {*} password
   * @param {*} type
   * @return {Promise}
   * @memberof Database
   */
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
        if (res.length === 0) {
          reject(new Error('User not found'));
        } else if (err) {
          reject(err);
        } else {
          let user = new User(
            res[0].Id,
            res[0].Email,
            res[0].FirstName,
            res[0].LastName,
            res[0].Type
          );
          winston.debug(user.toString());
          resolve(user);
        }
      });
    });
  }

  /**
   * This function inserts a new post to the database
   *
   * @param {*} post
   * @param {*} imageName
   * @param {*} sender
   * @return {Promise}
   * @memberof Database
   */
  addDashboardMsg(post, imageName, sender) {
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

  /**
   * This function selects all data from message table.
   *
   * @return {Promise}
   * @memberof Database
   */
  getAllThreads() {
    let query = 'SELECT * FROM messages';
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

  /**
   * This function inserts a new user into the database and subsequently into the
   * teacher or parent tables
   *
   * @param {*} user
   * @return {Promise}
   * @memberof Database
   */
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

  /**
   * Returns the user id given a user object
   *
   * @param {*} email
   * @return {Promise}
   * @memberof Database
   */
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

  /**
   * Returns all users from user table.
   *
   * @return {Promise}
   * @memberof Database
   */
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

  /**
   * Inserts a message sent in the private chat into the chat table.
   *
   * @param {*} rid
   * @param {*} sid
   * @param {*} time
   * @param {*} chat
   * @return {Promise}
   * @memberof Database
   */
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

  /**
   * Returns all messages from a private chat.
   *
   * @param {*} rid
   * @param {*} sid
   * @return {Promise}
   * @memberof Database
   */
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

  /**
   * This is used for the register test case to delete the test users created,
   * only if the user has email test@test.com
   *
   * @return {Promise}
   * @memberof Database
   */
  deleteUser() {
    let query = "delete from user where Email LIKE '%@test.com%';";
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        this.connection.connect();
      }
      this.connection.query(query, (err, res) => {
        winston.debug('deleting test users');
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Returns all users' group chats.
   *
   * @param {*} myId
   * @return {Promise}
   * @memberof Database
   */
  loadGroups(myId) {
    let query =
      "select GroupId, Title from groupMember where UserId='" + myId + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        let result = [];
        for (let i = 0; i < res.length; i++) {
          result.push(res[i]);
        }
        winston.debug('title : ' + JSON.stringify(result));
        resolve(result);
      });
    });
  }
  /**
   * Creates a group chat.
   *
   * @param {*} title
   * @param {*} admin
   * @return {Promise}
   * @memberof Database
   */
  formGroup(title, admin) {
    let query =
      "insert into groups (Title, Admin) values ('" +
      title +
      "', '" +
      admin +
      "'); SELECT LAST_INSERT_ID();";
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
  /**
   * Add a member to a group.
   * @param {*} groupId
   * @param {*} title
   * @param {*} userId
   * @return {Promise}
   * @memberof Database
   */
  addGroupMember(groupId, title, userId) {
    let query =
      "insert into groupMember (GroupId, Title, UserId) values ('" +
      groupId +
      "', '" +
      title +
      "', '" +
      userId +
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

  /**
   * Inserts a message passed to group chat in group chat table.
   *
   * @param {*} groupId
   * @param {*} sid
   * @param {*} chat
   * @return {Promise}
   * @memberof Database
   */
  sendGroupChat(groupId, sid, chat) {
    let query =
      "insert into groupChat (GroupMsg, `From` , GroupId) values ('" +
      chat +
      "','" +
      sid +
      "','" +
      groupId +
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
  /**
   *
   *
   * @param {*} id
   * @return {Promise}
   * @memberof Database
   */
  receivegroupChat(id) {
    let query =
      "select * from groupChat INNER JOIN user ON groupChat.`From` = user.Id where GroupId ='" +
      id +
      "';";
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
              res[i].DT,
              res[i].FirstName,
              res[i].LastName
            ]);
          }
          resolve(result);
        }
      });
    });
  }

  /**
   *
   *
   * @param {*} msgId
   * @return {Promise}
   * @memberof Database
   */
  like(msgId) {
    let query =
      "UPDATE messages SET messages.Like = messages.Like + 1 where MsgId='" +
      msgId +
      "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        let likes;
        winston.debug('db connection open');
        // winston.debug('Evaluated query: ' + query);
        let query =
          "select messages.Like from messages where MsgId='" + msgId + "';";
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

  /**
   * Function that resets a user's password.
   *
   * @param {User} user
   * @param {string} oldPassword
   * @param {string} newPassword
   * @return {Promise}
   * @memberof Database
   */
  changePassword(user, oldPassword, newPassword) {
    let query =
      'UPDATE user SET Password = MD5(' +
      newPassword +
      ') where Email = ' +
      user.email +
      'AND Password = MD5(' +
      oldPassword +
      ');';
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve();
      });
    });
  }

  /**
   * Function that load group requests for admin
   *@param {myId} myId
   * @return {Promise}
   * @memberof Database
   */
  loadRequest(myId) {
    let query =
      "SELECT * FROM groupRequest inner join user on groupRequest.userId = user.Id where groupRequest.Read = 'F' and Admin = '" +
      myId +
      "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }
  /**
   * Function that load group requests for admin
   *@param {myId} requestId
   * @return {Promise}
   * @memberof Database
   */
  updateGourpRequest(requestId) {
    let query =
      "update groupRequest set groupRequest.Read  = 'T'  where RequestId = '" +
      requestId +
      "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }
  /**
   * Function that search users' profiles
   * @param {searchString} searchString
   * @return {Promise}
   * @memberof Database
   */
  searchUser(searchString) {
    let query =
      "select * from user where FirstName Like '" +
      searchString +
      "'or LastName Like '" +
      searchString +
      "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Function that search gourps
   * @param {searchString} searchString
   * @return {Promise}
   * @memberof Database
   */
  searchGroup(searchString) {
    let query = "select * from groups where Title LIke '" + searchString + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Function that search gourps
   * @param {groupId} groupId
   * @param {myId} myId
   * @return {Promise}
   * @memberof Database
   */
  searchMyGroup(groupId, myId) {
    let query =
      "select GroupId from groupMember where UserId = '" +
      myId +
      "' and GroupId ='" +
      groupId +
      "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Function that request to add gourps
   * @param {groupId} groupId
   * @param {userId} userId
   * @param {title} title
   * @param {admin} admin
   * @return {Promise}
   * @memberof Database
   */
  addgroupRequest(groupId, userId, title, admin) {
    let query =
      "insert into groupRequest(GroupId,UserId,Title,Admin) values ('" +
      groupId +
      "', '" +
      userId +
      "', '" +
      title +
      "', '" +
      admin +
      "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Function that load admin's group
   
   * @param {admin} admin
   * @return {Promise}
   * @memberof Database
   */
  loadAdminGroup(admin) {
    let query = "SELECT * FROM groups where Admin = '" + admin + "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Function that load admin's group
   
   * @param {groupId} groupId
   * @param {userId} userId
   * @return {Promise}
   * @memberof Database
   */
  isIntheGroup(groupId, userId) {
    let query =
      "SELECT * FROM groupMember where groupId = '" +
      groupId +
      "' and userId = '" +
      userId +
      "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Increments the thread notification counter in the database.
   *
   * @param {Object} users A list of users to notify.
   * @return {Promise}
   * @memberof Database
   */
  addThreadNotification(users) {
    // TODO: embed update for each friend instead of everyone
    let query = 'UPDATE user set ThreadNotif = ThreadNotif + 1 ;';

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Increments the chat notification counter in the database.
   *
   * @param {Integer} id
   * @return {Promise}
   * @memberof Database
   */
  addChatNotification(id) {
    let query =
      "UPDATE user set chatNotif = chatNotif + 1 where Id ='" + id + "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   * Increments the group chat notification counter in the database.
   *
   * @param {*} groupId
   * @return {Promise}
   * @memberof Database
   */
  addGroupChatNotification(groupId) {
    let query =
      "select groupMember.UserId from groupMember inner join groups on groupMember.GroupId = groups.GroupId where groupMember.GroupId = '" +
      groupId +
      "' group by groupMember.UserId;";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;

        let newQuery =
          'UPDATE user set groupChatNotif = groupChatNotif + 1 where ';
        let tempIdQuery = '';
        res.forEach(elem => {
          tempIdQuery = tempIdQuery + 'Id = ' + elem.UserId + ' or ';
        });

        let idQuery = tempIdQuery.substring(0, tempIdQuery.length - 4);
        newQuery = newQuery + idQuery + ';';
        this.connection.query(newQuery, (err, res) => {
          winston.debug('db connection open');
          winston.debug('Evaluated query: ' + newQuery);
          if (err) throw err;
          resolve(res);
        });
      });
    });
  }

  /**
   *  Function that removes all notifications for a user
   *
   * @param {*} id
   * @return {Promise}
   * @memberof Database
   */
  removeNotifications(id) {
    let query =
      "UPDATE user set threadNotif = 0, chatNotif = 0, groupChatNotif = 0 where Id ='" +
      id +
      "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  /**
   *  Function that returns all notifications for a user
   *
   * @param {*} id
   * @return {Promise}
   * @memberof Database
   */
  getNotifications(id) {
    let query =
      "Select threadNotif, chatNotif, groupChatNotif from user where Id ='" +
      id +
      "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('db connection open');
        winston.debug('Evaluated query: ' + query);
        if (err) throw err;
        let notifArray = [];
        notifArray.push(res[0].threadNotif);
        notifArray.push(res[0].chatNotif);
        notifArray.push(res[0].groupChatNotif);
        resolve(notifArray);
      });
    });
  }
}
module.exports = new Database();
