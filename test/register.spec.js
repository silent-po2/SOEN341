/**
 * This test checks that the register process properly returns the correct status code
 * given a succesful or failed register attempt.
 */

let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let request = chai.request(app);
let expect = chai.expect;
let db = require('../db/Database');

describe('Register', function() {
  // Refresh the request before each test.
  beforeEach(() => (request = chai.request(app)));
  afterEach(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });

  after(() => {
    require('../app').stop();
  });

  describe('With valid parameters', function() {
    it('should succesfully register new user and redirect to /login', function(done) {
      request
        .post('/register')
        .type('form')
        .send({
          email: 'test@test.com',
          firstname: 'aaa',
          lastname: 'aaa',
          password: '111',
          password2: '111',
          userType: 'T'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;
          done();
        });
    });
  });

  describe('With unmatched passwords', function() {
    it('should not redirect to /login and have status code 401', function(done) {
      request
        .post('/login')
        .type('form')
        .send({
          email: 'test@test.com',
          firstname: 'aaa',
          lastname: 'aaa',
          password: '111',
          password2: '222',
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

  describe('With undefined email parameter', function() {
    it('should not redirect to /login and have status code 500', function(done) {
      request
        .post('/login')
        .type('form')
        .send({
          email: undefined,
          firstname: 'aaa',
          lastname: 'aaa',
          password: '111',
          password2: '111',
          userType: 'T'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(500);
          expect(res).to.not.redirect;
          done();
        });
    });
  });

  describe('With user type not accepted by the database', function() {
    it('should not redirect to /login and have status code 401', function(done) {
      request
        .post('/login')
        .type('form')
        .send({
          email: 'test@test.com',
          firstname: 'aaa',
          lastname: 'aaa',
          password: '111',
          password2: '111',
          userType: 'test'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          expect(res).to.not.redirect;
          done();
        });
    });
  });
});
