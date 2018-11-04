/**
 * This test checks that the logout process properly returns the correct status code.
 */

let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let request = chai.request(app);
let expect = chai.expect;

describe('Logout', function() {
  after(() => {
    require('../app').stop();
  });

  describe('When pressing logout', function() {
    it('should succesfully logout and redirect to /login', function(done) {
      request.get('/logout').end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.redirect;
        done();
      });
    });
  });
});
