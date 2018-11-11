/**
 * This test checks that the dashboard posting process properly returns the correct status code
 * given a succesful post attempt.
 */

let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
let agent = chai.request.agent(app);

describe('Dashboard', function() {
  afterEach(() => {
    db.deleteUser().catch(err => {
      // if error is returned, there was no user to delete.
    });
  });

  after(() => {
    require('../app').stop();
  });

  describe('Register user, login and open dashboard', function() {
    it('should be able to post to the dashboard', function(done) {
      let user = {
        email: 'test@test.com',
        firstname: 'aaa',
        lastname: 'aaa',
        password: '111',
        password2: '111',
        userType: 'T'
      };
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
                .post('/dashboard')
                .send({ post: 'test' })
                .end(function(err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  expect(res).to.redirect;
                  done();
                });
            });
        });
    });

    describe('Register user, login and open dashboard', function() {
      it('should be not be able to post an empty message to the dashboard', function(done) {
        agent
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
            agent
              .post('/login')
              .type('form')
              .send({
                email: 'test@test.com',
                password: '111',
                userType: 'T'
              })
              .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.redirect;
                agent
                  .post('/dashboard')
                  .send({ post: '' })
                  .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(401);
                    expect(res).to.not.redirect;
                    done();
                  });
              });
          });
      });
    });
  });
});
