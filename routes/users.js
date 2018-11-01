/**
 * This is the file that manages all routes called by a user
 * The request parameter holds the address displayed in the browser.
 */

// todo: add teacher/parent type on the link instead of passing session var

let userController = require('../controllers/userController');

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

  app.get('/dashboard', userController.dashboard);

  app.post(
    '/dashboard',
    userController.upload.single('myImage'),
    userController.dashboardPost
  );

  app.get('/contacts', userController.contacts);

  app.post('/contacts', userController.contactsPost);
  // ! not be able to register Error: ER_PARSE_ERROR: You have an error in your SQL syntax;
  app.post('/register', userController.registerPost);

  // ! when login with wrong email or password, login page stucks
  app.post('/login', userController.loginPost);

  app.get('/logout', userController.logout);

  app.get('/groupchat/:title', userController.groupchat);

  app.post('/groupchat/:title', userController.groupchatPost);

  app.get('/chat/:id', userController.chat);

  app.post('/chat/:id', userController.chatPost);

  app.use('*', function(req, res) {
    res.locals.user = req.user || null;
  });
};
