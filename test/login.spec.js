/**
 * This test checks that the login process properly returns the correct status code
 * given a succesful or failed login attempt.
 */

let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let request = chai.request(app);
let expect = chai.expect;
process.env.NODE_ENV = 'test';

describe('Login', function() {
  // Refresh the request before each test.
  beforeEach(() => (request = chai.request(app)));

  after(() => {
    require('../app').stop();
  });

  describe('With valid username/password/userType', function() {
    it('should succesfully login and redirect to profile', function(done) {
      request
        .post('/login')
        .type('form')
        .send({ email: 'chan@gmail.com', password: '111', userType: 'T' })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;
          done();
        });
    });
  });

  describe('With valid username/password but invalid user type', function() {
    it('should not redirect to /profile and have status code 401', function(done) {
      request
        .post('/login')
        .type('form')
        .send({ email: 'chan@gmail.com', password: '111', userType: 'P' })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          expect(res).to.not.redirect;
          done();
        });
    });
  });

  describe('With valid username/type but invalid password', function() {
    it('should not redirect to /profile and have status code 401', function(done) {
      request
        .post('/login')
        .type('form')
        .send({
          email: 'chan@gmail.com',
          password: 'badPassword',
          userType: 'T'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          expect(res).to.not.redirect;
          done();
        });
    });
  });

  describe('With valid password/type but invalid username', function() {
    it('should not redirect to /profile and have status code 401', function(done) {
      request
        .post('/login')
        .type('form')
        .send({ email: 'badUser', password: '111', userType: 'T' })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          expect(res).to.not.redirect;
          done();
        });
    });
  });
});
