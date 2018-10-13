// this is a test file, i will delete it once build works
let app = require('../app');
let expect = require('chai').expect;
let userController = require('../controllers/userController');

describe('Testing routes', function() {
  describe('GET /', function() {
    it('should return a 200 response', function() {
      app.get('/', userController.userHome).expect(200, done);
    });
  });
});
