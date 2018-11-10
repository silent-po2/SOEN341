let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let expect = chai.expect;
let db = require('../db/Database');
//let userController = require('../controllers/userController');

let agent = chai.request.agent(app);



describe('Profile', function() {

    afterEach(() => {
        db.deleteUser().catch(err => {
            // if error is returned, there was no user to delete.
        });

    });

    describe('Login and edit profile', function() {

        it('should be able to register, login as a teacher and edit profile', function(done) {
            let user =
            {
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
                                .post('/editprofile')
                                .send({
                                    firstname: "Tanya",
                                    lastname: "Multani",
                                    email: "testingg@test.com"
                                })
                                .then(function(res) {
                                    expect(err).to.be.null;
                                    expect(res).to.have.status(200);
                                    expect(res).to.redirect;
                                    done();
                                });
                        });
                });

        });

        it('should not redirect to /profile and have status code 401 because email already exists', function (done) {
            let user =
            {
                email: 'testingg@tests.com',
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
                                .post('/editprofile')
                                .send({
                                    firstname: user.firstname,
                                    lastname: user.lastname,
                                    email: "chan@gmail.com"
                                })
                                .then(function(res) {
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