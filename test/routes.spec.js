let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let request = chai.request(app);
let expect = chai.expect;
process.env.NODE_ENV = 'test';

describe('Testing routes', function() {
  beforeEach(() => (request = chai.request(app)));
  after(() => {
    require('../app').stop();
  });

  describe('GET /', function() {
    it('should return a 200 response', function(done) {
      request.get('/').end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
    });
  });

  describe('GET /login', function() {
    it('should return a 200 response', function(done) {
      request.get('/login').end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
    });
  });

  describe('GET /register', function() {
    it('should return a 200 response', function(done) {
      request.get('/register').end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
    });
  });

  describe('GET /dashboard', function() {
    it('should return a 200 response', function(done) {
      request.get('/dashboard').end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
    });
  });

  describe('GET /logout', function() {
    it('should return a 200 response', function(done) {
      request.get('/logout').end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
    });
  });
});
