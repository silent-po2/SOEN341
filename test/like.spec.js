/**
 * This test checks that the dashboard like process properly returns the correct status code
 * given a succesful like
 */

let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
let agent = chai.request.agent(app);

let number = { msgId: '145' };
let user = {
  email: 'test@test.com',
  firstname: 'aaa',
  lastname: 'aaa',
  password: '111',
  password2: '111',
  userType: 'T'
};

describe('Dashboard', function() {
  // Refresh the app before each test
  beforeEach(() => {
    agent = chai.request.agent(app);
  });

  afterEach(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });

  afterEach(() => {
    require('../app').stop();
  });

  describe('Register user, login and open dashboard', function() {
    it('should be able to like a post on the dashboard', function(done) {
      agent
        .post('/register')
        .type('form')
        .send(user)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;
          agent
            .post('/login')
            .type('form')
            .send({
              email: user.email,
              password: user.password,
              userType: user.userType
            })
            .end(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.redirect;
			  
              agent
			  .post('/like')
			  .send(number)
                .end(function(err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  expect(res).to.not.redirect;
                  done();
                });
            });
        });
    });
  });
});
