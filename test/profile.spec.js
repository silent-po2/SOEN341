let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
let winston = require('../config/winston');

let agent = chai.request.agent(app);

// Mock user data
let user1 = {
  email: 'test1@test.com',
  firstName: 'test1',
  lastName: 'test1',
  password: '111',
  type: 'T'
};
let user2 = {
  email: 'test2@test.com',
  firstName: 'test2',
  lastName: 'test2',
  password: '111',
  type: 'T'
};

describe('Profile', function() {
  // Refresh the app before each test
  beforeEach(() => {
    agent = chai.request.agent(app);
  });

  // Resgister mock user and save id.
  before(() => {
    return db
      .register(user1)
      .then(() => {
        db.register(user2);
      })
      .catch(err => {
        winston.error(err.stack);
      });
  });

  afterEach(() => {
    require('../app').stop();
  });

  after(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });

  describe('Login and edit profile', function() {
    it('Should be able to edit profile', function(done) {
      agent
        .post('/login')
        .type('form')
        .send({
          email: user1.email,
          password: user1.password,
          userType: user1.type
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;
          agent
            .post('/editprofile')
            .type('form')
            .send({
              firstname: 'Tanya',
              lastname: 'Multani',
              email: user1.email
            })
            .then(function(res) {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.redirect;
              done();
            });
        });
    });
  });

  // TODO: error is caught and the process lags for some reason...
  // I am not sure why the rejected promise is hanging the code
  describe.skip('Login and edit profile', function() {
    it('should not be able to edit with exsisting email', function(done) {
      agent
        .post('/login')
        .type('form')
        .send({
          email: user1.email,
          password: user1.password,
          userType: user1.type
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;
          agent
            .post('/editprofile')
            .type('form')
            .send({
              firstname: user1.firstName,
              lastname: user1.lastName,
              email: user2.email
            })
            .then(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(401);
              expect(res).to.not.redirect;
              done();
            });
        });
    });
  });
});
