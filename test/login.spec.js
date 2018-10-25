let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let request = chai.request(app);
let should = chai.should();

it('should return true if valid user id', function (done) {
    userController.login(
        function (isValid) {
            assert.equal(isValid, true);
            done();
        });
});