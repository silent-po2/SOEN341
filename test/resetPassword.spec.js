/**
 * This test checks that the password reset process properly returns the correct status code
 * given a succesful and unsuccesful attempt.
 */

let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
let agent = chai.request.agent(app);

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

  describe('With valid second password', function() {
    it('should be able to reset password and login with new password', function(done) {
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
                .post('/passwordreset')
                .send({
                  oldPassword: user.password,
                  newPassword: '222',
                  repeatPassword: '222'
                })
                .end(function(err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  expect(res).to.redirect;
                  agent
                    .post('/login')
                    .type('form')
                    .send({
                      email: user.email,
                      password: '222',
                      userType: user.userType
                    })
                    .end(function(err, res) {
                      expect(err).to.be.null;
                      expect(res).to.have.status(200);
                      expect(res).to.redirect;
                      done();
                    });
                });
            });
        });
    });
  });
  describe('With unmatching passwords', function() {
    it('should not be able to reset password', function(done) {
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
                .post('/passwordreset')
                .send({
                  oldPassword: user.password,
                  newPassword: '222',
                  repeatPassword: '333'
                })
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
