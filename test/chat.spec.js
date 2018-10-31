let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');

/** describe('Chat', function () {

    after(function (done) {
        //delete chat messages from db
    });
*/
describe('Login and chat with another user', function () {

    it('should be able to login as a teacher and chat with another user', function (done) {
        let user = { email: "chan@gmail.com", password: "111", userType: "T" }

        /**chai
            .request(app)
            .post('/login')
            .type('form')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.redirect;
                chai
                    .request(app)
                    .post('/chat/168')
                    .send({ chat: 'test2' })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res).to.redirect;
                        done();
                    });
            });
        */

        let agent = chai.request.agent(app);

        agent
            .post('/login')
            .send(user)
            .then((res) => {
                agent.post('/chat/168')
                    .send({ chat: 'test5' })
                    .then((res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.redirect;
                        done();
                    }).catch(err => {
                        done(err);
                    });
            });


        /**chai
            .request(app)
            .post('/chat/168')
            .send({ post: 'testing' })
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.redirect;
                done();
            });
            */

        /**agent
            .post('/login')
            .send(user)
            .then((res) => {
                return agent.post('/chat/168')
                    .send({ chat: 'testing' })
                    .then((res) => {
                        res.should.have.status(200);
                        done();
                    }).catch(function (err) {
                        throw err;
                    });
            });
        */

    });
});
