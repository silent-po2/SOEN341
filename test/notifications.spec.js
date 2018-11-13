/**
 * This test checks that the notification process properly returns the correct status code
 * gives the correct notification count.
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

describe('Notifications', function() {
  // Register mock users test1 and test2 in the database
  // Save the id of user 1.
  before(() => {
    return db
      .register(user1)
      .then(() => {
        return db.register(user2);
      })
      .then(() => {
        return db.getId(user1.email);
      })
      .then(function(id) {
        user1.id = id;
      })
      .then(() => {
        return db.getId(user2.email);
      })
      .then(function(id) {
        user2.id = id;
      })
      .catch(err => {
        winston.error(err.stack);
      });
  });

  // --------------------- Dashboard Test ---------------------
  describe('Dashboard Posts', function() {
    // Have test2 login and post to dashboard
    before(done => {
      agent
        .post('/login')
        .type('form')
        .send({
          email: user2.email,
          password: user2.password,
          userType: user2.type
        })
        .end(function(err, res) {
          if (err) winston.error(err.message);
          agent
            .post('/dashboard')
            .type('form')
            .send({
              post: 'test'
            })
            .end(function(err, res) {
              if (err) winston.error(err.message);
              done();
            });
        });
    });

    describe('When other user posts to dashboard', function() {
      it('Should be able to see change in notification count for thread', function(done) {
        let currentNotifs;
        agent = chai.request.agent(app);
        // Login User
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

            // Retreive notification count for user 1
            db.getNotifications(user1.id).then(function(notifs) {
              currentNotifs = notifs;

              // Mark notifications as read
              agent.post('/notifications').end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.not.redirect;

                // Retreive notification count
                db.getNotifications(user1.id).then(function(newNotifs) {
                  expect(currentNotifs[0] - newNotifs[0]).to.equal(1);
                  expect(currentNotifs[1] - newNotifs[1]).to.equal(0);
                  expect(currentNotifs[2] - newNotifs[2]).to.equal(0);
                  done();
                });
              });
            });
          });
      });
    });
  });

  // --------------------- Chat Test ---------------------
  describe('Chat messages', function() {
    // Have user2 login and send a message to user1
    before(done => {
      agent
        .post('/login')
        .type('form')
        .send({
          email: user2.email,
          password: user2.password,
          userType: user2.type
        })
        .end(function(err, res) {
          if (err) winston.error(err.message);
          agent
            .post('/chat/' + user1.id)
            .type('form')
            .send({
              chat: 'test'
            })
            .end(function(err, res) {
              if (err) winston.error(err.message);
              done();
            });
        });
    });

    describe('When other user posts a message to the chat', function() {
      it('Should be able to see change in notification count for chat', function(done) {
        let currentNotifs;
        agent = chai.request.agent(app);
        // Login User
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

            // Retreive notification count for user 1
            db.getNotifications(user1.id).then(function(notifs) {
              currentNotifs = notifs;

              // Mark notifications as read
              agent.post('/notifications').end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.not.redirect;

                // Retreive notification count
                db.getNotifications(user1.id).then(function(newNotifs) {
                  expect(currentNotifs[0] - newNotifs[0]).to.equal(0);
                  expect(currentNotifs[1] - newNotifs[1]).to.equal(1);
                  expect(currentNotifs[2] - newNotifs[2]).to.equal(0);
                  done();
                });
              });
            });
          });
      });
    });
  });

  // --------------------- Group Chat Test ---------------------
  // TODO

  after(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });

  after(() => {
    require('../app').stop();
  });
});
