let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
let agent = chai.request.agent(app);
let anotherUser = { email: "chan@gmail.com", password: "111", userType: "T" };
let anotherID = 0;
let id = db.getId(anotherUser.email).then(function (val) {
    anotherID = val;
}).catch(function (err) {
    throw err;
});


describe('Chat', function() {

    afterEach(() => {
        db.deleteUser().catch(err => {
            // if error is returned, there was no user to delete.
        });
        //db.deleteAnotherUser().catch(err => {
        // if error is returned, there was no user to delete.
        //});
    });

    describe('Login and chat with another user', function() {

        it('should be able to register as a teacher, login and chat with another user', function(done) {
            let user =
            {
                email: 'test@test.com',
                firstname: 'aaa',
                lastname: 'aaa',
                password: '111',
                password2: '111',
                userType: 'T'
            };
            /**let anotherUser =
            {
                email: 'tests@testing.com',
                firstname: 'bbb',
                lastname: 'bbb',
                password: '111',
                password2: '111',
                userType: 'T'
            }
            */
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
                                .post('/chat/' + anotherID)
                                .send({ chat: 'testing' })
                                .then(function(res) {
                                    expect(err).to.be.null;
                                    expect(res).to.have.status(200);
                                    expect(res).to.not.redirect;
                                    done();
                                });

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

                            /**  agent
                                 .post('/login')
                                 .send(user)
                                 .then((res) => {
                                     agent.post('/chat/' + db.getId("chan@gmail.com"))
                                         .then((res) => {
                                             return res;
                                         })
                                         .send({ chat: 'test8' })
                                         .then((res) => {
                                             expect(res).to.have.status(200);
                                             expect(res).to.redirect;
                                             done();
                                         }).catch(err => {
                                             done(err);
                                         });
                                 });
                     */

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


        });

        it('should be able to register as a teacher, login but not be able to send empty message on chat', function(done) {
            let user =
            {
                email: 'test@test.com',
                firstname: 'aaa',
                lastname: 'aaa',
                password: '111',
                password2: '111',
                userType: 'T'
            };
            /**let anotherUser =
            {
                email: 'tests@testing.com',
                firstname: 'bbb',
                lastname: 'bbb',
                password: '111',
                password2: '111',
                userType: 'T'
            }
            */
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
                                .post('/chat/' + anotherID)
                                .send({ chat: '' })
                                .then(function(res) {
                                    expect(err).to.be.null;
                                    expect(res).to.have.status(200);
                                    expect(res).to.not.redirect;
                                    done();
                                });

                        });
                });


        });


    });


});

