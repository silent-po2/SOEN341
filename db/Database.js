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
      if (err) reject(err);
      winston.debug('db closed');
    });
  }

  /**
   * Returns a promise with the user id if user is found, rejects otherwise
   *
   * @param {String} email - The email of a user.
   * @param {String} password - The password of the user.
   * @param {Char} type - The user type.
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
   * This function inserts a new thread to the database
   *
   * @param {String} post - The message of the thread to save.
   * @param {Object} imageName - The image uploaded.
   * @param {String} sender - A user name of a the sender.
   * @param {Integer} id - The sender's user ID.
   * @return {Promise}
   * @memberof Database
   */
  addDashboardMsg(post, imageName, sender, id) {
    let query =
      "insert into thread(Message, ImageName, Sender, SenderId) values ('" +
      post +
      "', '" +
      imageName +
      "', '" +
      sender +
      "', '" +
      id +
      "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
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
    let query = 'SELECT * FROM thread ORDER by MsgId DESC';
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
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
   * @param {User} user - A user object.
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
   * @param {String} email -  The email of a user.
   * @return {Promise}
   * @memberof Database
   */
  getId(email) {
    let query = "select Id from user where Email='" + email + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, rows) => {
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
   * @param {Integer} rid - A receiver user ID.
   * @param {Integer} sid - A sender user ID.
   * @param {String} time - The time stamp of the message.
   * @param {String} chat - The chat message.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  /**
   * Returns all messages from a private chat.
   *
   * @param {Integer} rid - A receiver user ID.
   * @param {Integer} sid - A sender user ID.
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
   * This is used for test cases to delete the test users created,
   * only if the user has email '...@test.com'
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
   * Returns group chat data for a user.
   *
   * @param {Integer} id
   * @return {Promise}
   * @memberof Database
   */
  loadGroups(id) {
    let query =
      "select GroupId, Title from groupMember where UserId='" + id + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
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
   * @param {String} title - The title of the group chat.
   * @param {Integer} admin - The user ID of the admin of the group chat.
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
        winston.debug('Evaluated query: ' + query);
        if (err) {
          reject(err);
        } else resolve(res);
      });
    });
  }
  /**
   * Add a member to a group.
   *
   * @param {Integer} groupId - A group chat ID.
   * @param {String} title - The title of the group chat.
   * @param {Integer} userId - A user ID.
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
   * @param {Integer} groupId - A group chat ID.
   * @param {Integer} sid -  A sender user ID.
   * @param {String} chat - The message to be saved.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  /**
   * Selects all group chat data from a user.
   *
   * @param {Integer} id - A group chat ID.
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
   * Function that updates the like counter of a thread message.
   *
   * @param {Integer} msgId - A message ID in the dashboard.
   * @return {Promise}
   * @memberof Database
   */
  like(msgId) {
    let query =
      "UPDATE thread SET thread.Like = thread.Like + 1 where MsgId='" +
      msgId +
      "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        let likes;
        winston.debug('Evaluated query: ' + query);
        query = "select thread.Like from thread where MsgId='" + msgId + "';";
        this.connection.query(query, (err, res) => {
          winston.debug('Evaluated query: ' + query);
          if (err) reject(err);
          else {
            likes = res;
            resolve(likes);
          }
        });
      });
    });
  }
  /**
   * Function that edit a user's profile.
   *
   * @param {User} user - A user object.
   * @return {Promise}
   * @memberof Database
   */
  editProfile(user) {
    let query =
      "UPDATE user SET Email = '" +
      user.email +
      "', FirstName = '" +
      user.firstName +
      "', LastName = '" +
      user.lastName +
      "' where Id = '" +
      user.id +
      "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve();
      });
    });
  }

  /**
   * Function that updates a user's password.
   *
   * @param {User} user - A user object.
   * @param {String} oldPassword - The old password.
   * @param {String} newPassword - The new password.
   * @return {Promise}
   * @memberof Database
   */
  changePassword(user, oldPassword, newPassword) {
    let query =
      "UPDATE user SET Password = MD5('" +
      newPassword +
      "') where Email = '" +
      user.email +
      "'AND Password = MD5('" +
      oldPassword +
      "');";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve();
      });
    });
  }

  /**
   * Function that load group requests for admin
   *
   *@param {Integer} id - A user ID.
   * @return {Promise}
   * @memberof Database
   */
  loadRequest(id) {
    let query =
      "SELECT * FROM groupRequest inner join user on groupRequest.userId = user.Id where groupRequest.Read = 'F' and Admin = '" +
      id +
      "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }
  /**
   * Function that load group requests for admin
   *
   *@param {Integer} requestId - A user ID.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }
  /**
   * Function that search users' profiles
   *
   * @param {String} searchString - A string to search for.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Function that search gourps
   *
   * @param {String} searchString - A string to search for.
   * @return {Promise}
   * @memberof Database
   */
  searchGroup(searchString) {
    let query = "select * from groups where Title LIke '" + searchString + "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Function that search gourps
   *
   * @param {groupId} groupId - A group chat ID.
   * @param {Integer} id - A user ID.
   * @return {Promise}
   * @memberof Database
   */
  searchMyGroup(groupId, id) {
    let query =
      "select GroupId from groupMember where UserId = '" +
      id +
      "' and GroupId ='" +
      groupId +
      "';";
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Function that request to add gourps
   *
   * @param {groupId} groupId - A group chat ID.
   * @param {userId} userId -  A user ID.
   * @param {title} title - The title of the group chat.
   * @param {admin} admin - The ID of the admin of the group chat.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Function that load admin's group
   
   * @param {admin} admin - An user ID that is the admin of a group.
   * @return {Promise}
   * @memberof Database
   */
  loadAdminGroup(admin) {
    let query = "SELECT * FROM groups where Admin = '" + admin + "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Function that load admin's group
   
   * @param {groupId} groupId - A group chat ID.
   * @param {userId} userId - A user ID.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Increments the chat notification counter in the database.
   *
   * @param {Integer} id - A user ID.
   * @return {Promise}
   * @memberof Database
   */
  addChatNotification(id) {
    let query =
      "UPDATE user set chatNotif = chatNotif + 1 where Id ='" + id + "';";

    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, res) => {
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   * Increments the group chat notification counter in the database.
   *
   * @param {Integer} groupId - A group chat ID.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);

        let newQuery =
          'UPDATE user set groupChatNotif = groupChatNotif + 1 where ';
        let tempIdQuery = '';
        res.forEach(elem => {
          tempIdQuery = tempIdQuery + 'Id = ' + elem.UserId + ' or ';
        });

        let idQuery = tempIdQuery.subString(0, tempIdQuery.length - 4);
        newQuery = newQuery + idQuery + ';';
        this.connection.query(newQuery, (err, res) => {
          winston.debug('Evaluated query: ' + newQuery);
          if (err) reject(err);
          resolve(res);
        });
      });
    });
  }

  /**
   *  Function that removes all notifications for a user
   *
   * @param {Integer} id A user ID.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  /**
   *  Function that returns all notifications for a user
   *
   * @param {Integer} id - A user ID.
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
        winston.debug('Evaluated query: ' + query);
        if (err) reject(err);
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
