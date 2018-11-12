let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
let agent = chai.request.agent(app);

describe('Chat', function() {
    afterEach(() => {
        db.deleteUser().catch(err => {
            // if error is returned, there was no user to delete.
        });
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
            let anotherUser =
            {
                email: 'tests@test.com',
                firstname: 'bbb',
                lastname: 'bbb',
                password: '111',
                password2: '111',
                userType: 'T'
            }
            agent
                .post('/register')
                .type('form')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res).to.redirect;
                    agent
                        .post('/register')
                        .type('form')
                        .send(anotherUser)
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
                                    db.getId(anotherUser.email).then(function(val) {
                                        agent
                                            .post('/chat/' + val)
                                            .send({ chat: 'testing' })
                                            .end(function(err, res) {
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



    });


});