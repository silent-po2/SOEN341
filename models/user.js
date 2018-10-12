/**
 * This is the user prototype that we will use as a super class, these are the people who use our website
 * @param {*} email
 * @param {*} firstName
 * @param {*} lastName
 */

// constructor
function User(id, email, firstName, lastName, password, type) {
  this.id = id;
  this.email = email;
  this.firstName = firstName;
  this.lastName = lastName;
  this.password = password;
  this.type = type;
}
// add functions specific to users
User.prototype.register = () => {
  // TODO
};

User.prototype.login = () => {
  // TODO
};

User.prototype.getType = () => {
  return type;
};
User.prototype.getId = () => {
  return id;
};

module.exports = User;
