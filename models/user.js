/**
 * This is the user prototype that we will use as a super class, these are the main actors on the system.
 * @param {*} email
 * @param {*} firstName
 * @param {*} lastName
 */

/**
 * The constructor for the user object.
 *
 * @constructor
 * @param {int} id The Id generated by the database.
 * @param {string} email The email of the user.
 * @param {string} firstName The first name of the user.
 * @param {string} lastName The last name of the user.
 * @param {char} type The type, teacher or parent, of the user.
 */
function User(id, email, firstName, lastName, type) {
  this.id = id;
  this.email = email;
  this.firstName = firstName;
  this.lastName = lastName;
  this.type = type;
}

User.prototype.toString = function() {
	return "The user's ID is: " + this.id + " " + ", email is: " + this.email + " and user's name is: " + this.firstName + " " + this.lastName + " and they are a " + this.type; 
}

module.exports = User;
