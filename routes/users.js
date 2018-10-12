/**
 * This is the file that manages all routes called by a user
 * The request parameter holds the address displayed in the browser.
 */

let userController = require('../controllers/userController');
// todo: add teacher/parent type on the link instead of passing session var?
module.exports = function(app) {
  // Get user home page, default startup page
  app.get('/', userController.userHome);

  // Login and register views
  app.get('/login', userController.login);

  app.get('/register', userController.register);

  app.get('/dashboard', userController.dashboard);

  app.post('/dashboard', userController.dashboardPost);

  // not be able to register Error: ER_PARSE_ERROR: You have an error in your SQL syntax;
  app.post('/register', userController.registerPost);

  app.post('/login', userController.loginPost); // when login with wrong email or password, login page stucks

  app.get('/logout', userController.logout);

  app.use('*', function(req, res) {
    res.locals.user = req.user || null;
  });

  app.get('/:type/loginTeacher', userController.loginTeacherGet);

  app.get('/loginParent', userController.loginParentGet);

  app.get('/registerParent', userController.registerParentGet);

  app.get('/registerTeacher', userController.registerTeacherGet);

  app.post('/loginTeacher', userController.loginPost);

  app.post('/loginParent', userController.loginPost);

  // app.post('/registerTeacher', userController.registerPost);

  // app.post('/registerParent', userController.registerPost);

  // GET request to delete a user
  app.get('/:id/delete', userController.deleteUserGet);

  // POST request to delete a user.
  app.post('/:id/delete', userController.deleteUserPost);

  // GET request to update a user.
  app.get('/:id/update', userController.updateUserGet);

  // POST request to update user.
  app.post('/:id/update', userController.updateUserPost);

  // GET request for one user.
  app.get('/:id', userController.listUser);

  // GET request for list of all users.
  app.get('/todo', userController.listAllUsers);
};
