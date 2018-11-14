/**
 * This test checks that the chat process properly returns the correct status code
 * and saves the proper
 */

let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
let agent = chai.request.agent(app);
let winston = require('../config/winston');

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
let message = 'testing chat';
describe('Chat', function () {
  // Register mock users test1 and test2 in the database
  // Save the id of users.
  before(() => {
    return db
      .register(user1)
      .then(() => {
        return db.register(user2);
      })
      .then(() => {
        return db.getId(user1.email);
      })
      .then(function (id) {
        user1.id = id;
      })
      .then(() => {
        return db.getId(user2.email);
      })
      .then(function (id) {
        user2.id = id;
      })
      .catch(err => {
        winston.error(err.stack);
      });
  });

  // Refresh the app before each test
  beforeEach(() => {
    agent = chai.request.agent(app);
  });

  after(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });

  afterEach(() => {
    require('../app').stop();
  });

  describe('User1 login and chat', function () {
    it('Should be able to send message to user2', function (done) {
      agent
        .post('/login')
        .type('form')
        .send({
          email: user1.email,
          password: user1.password,
          userType: user1.type
        })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;

          agent
            .post('/chat/' + user2.id)
            .send({ chat: message })
            .end(function (err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.not.redirect;
              done();
            });
        });
    });
  });

  describe('User2 login and see message', function () {
    it('Should be able to see message from user2', function (done) {
      agent
        .post('/login')
        .type('form')
        .send({
          email: user2.email,
          password: user2.password,
          userType: user2.type
        })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;

          agent.get('/chat/' + user1.id).end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.not.redirect;
            db.receiveChat(user2.id, user1.id).then(result => {
              expect(result[0]).to.include(message);
              done();
            });
          });
        });
    });
  });
});
