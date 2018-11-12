/**
 * This is the file that manages all routes called by a user
 * The request parameter holds the address displayed in the browser.
 */

// todo: add teacher/parent type on the link instead of passing session var

let userController = require('../controllers/userController');
let dashboardController = require('../controllers/dashboardController');
let chatController = require('../controllers/chatController');

/**
 * This function contains all routes called by a user.
 *
 * @param {Object} app - Express app that holds HTTP methods to handle requests.
 */
module.exports = function(app) {
  app.get('/', userController.userHome);

  app.get('/login', userController.login);

  app.get('/register', userController.register);

  app.get('/profile', userController.profile);

  app.get('/editprofile', userController.editProfile);

  app.post('/editprofile', userController.editProfilePost);

  app.get('/dashboard', dashboardController.dashboard);

  app.post(
    '/dashboard',
    dashboardController.upload.single('myImage'),
    dashboardController.dashboardPost
  );

  app.get('/contacts', userController.contacts);

  app.get('/notifications', userController.getNotifications);

  app.post('/notifications', userController.readNotifications);

  app.post('/contacts', userController.contactsPost);
  // ! not be able to register Error: ER_PARSE_ERROR: You have an error in your SQL syntax;
  app.post('/register', userController.registerPost);

  // ! when login with wrong email or password, login page stucks
  app.post('/login', userController.loginPost);

  app.get('/logout', userController.logout);

  app.get('/groupchat/:id', chatController.groupchat);

  app.get('/groups', userController.groups);

  app.post('/groupchat/:id', chatController.groupchatPost);

  app.get('/chat/:id', chatController.chat);

  app.post('/chat/:id', chatController.chatPost);

  app.post('/requests', userController.handleRequest);

  app.post('/search', userController.search);

  app.post('/searchuser', userController.searchUser);

  // app.get('/search', userController.searchGet);

  app.post('/profiles/:id', userController.othersProfile);

  app.post('/addgroup/:id', userController.addRequest);

  app.get('/adduser/:id', userController.adduserGet);

  app.post('/adduser/', userController.adduserPost);

  app.post('/likes', dashboardController.like);

  app.use('*', function(req, res) {
    res.locals.user = req.user || null;
  });
};
