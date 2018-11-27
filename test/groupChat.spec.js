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
let user3 = {
  email: 'test3@test.com',
  firstName: 'test3',
  lastName: 'test3',
  password: '111',
  type: 'P'
};

describe('Group chat', function() {
  before(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });
  // Register mock users and save their id's
  before(() => {
    return db
      .register(user1)
      .then(() => {
        return db.register(user2);
      })
      .then(() => {
        return db.register(user3);
      })
      .then(() => {
        return db.getId(user1.email);
      })
      .then(function(id) {
        user1.id = id;
        return db.getId(user2.email);
      })
      .then(function(id) {
        user2.id = id;
        return db.getId(user3.email);
      })
      .then(function(id) {
        user3.id = id;
      })
      .catch(err => {
        winston.error(err.stack);
      });
  });

  after(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });

  after(() => {
    require('../app').stop();
  });

  describe('User creates a group chat', function() {
    it('Should redirect with status code 200', function(done) {
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

          // Create a new group chat and add user2 and user3
          agent
            .post('/contacts')
            .type('form')
            .send({
              userId: [user2.id, user3.id],
              groupName: 'test'
            })
            .end(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.redirect;

              // Retreive groupdId
              db.loadGroups(user1.id).then(result => {
                user1.groupId = result[0].GroupId;
                done();
              });
            });
        });
    });
  });

  describe('Second user posts to group chat', function() {
    it('Should be receive status code 200', function(done) {
      agent = chai.request.agent(app);

      // Login User
      agent
        .post('/login')
        .type('form')
        .send({
          email: user2.email,
          password: user2.password,
          userType: user2.type
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;

          // Create a new group chat and add user2 and user3
          agent
            .post('/groupchat/' + user1.groupId)
            .type('form')
            .send({
              groupchat: 'test'
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

  describe('Third user posts empty message to group chat', function() {
    it('Should not redirect with status code 400', function(done) {
      agent = chai.request.agent(app);

      // Login User
      agent
        .post('/login')
        .type('form')
        .send({
          email: user3.email,
          password: user3.password,
          userType: user3.type
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.redirect;

          // Create a new group chat and add user2 and user3
          agent
            .post('/groupchat/' + user1.groupId)
            .type('form')
            .send({
              groupchat: ''
            })
            .end(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res).to.not.redirect;
              done();
            });
        });
    });
  });
});
