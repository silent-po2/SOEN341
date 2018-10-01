/**
 * This is the user prototype that we will use as a super class, these are the people who use our website
 * @param {*} id
 * @param {*} email
 * @param {*} firstName
 * @param {*} lastName
 * @param {*} type
 */

// constructor
function User(id, email, firstName, lastName, type) {
  this.id = id;
  this.email = email;
  this.firstName = firstName;
  this.lastName = lastName;
  this.type = type;
}
// add functions specific to users
User.prototype.register = () => {
  // TODO
};

User.prototype.login = () => {
  // TODO
};

module.exports = User;
