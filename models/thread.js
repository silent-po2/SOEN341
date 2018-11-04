
/**
 * The constructor for the thread object.
 *
 * @constructor
 * @param {int} postId The postId generated by the database.
 * @param {string} post The thread's post.
 */
function Thread(postId, post) {
  this.postId = postId;
  this.post = post;
}

Thread.prototype.toString = function() {
	return "The thread post's ID is: " + this.postId + " and post itself is: " + this.post; 
}

module.exports = Thread;