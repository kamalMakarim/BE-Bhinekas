/**
 * User class
 * @class User
 */
class User {

    /**
     * @param {string} user_id - The user ID
     * @param {string} username - The username
     * @param {string} password - The password
     * @param {string} display_name - The display name
     */

    constructor(user_id, username, password, display_name) {
        this.user_id = user_id;
        this.username = username;
        this.password = password;
        this.display_name = display_name;
    }
}

module.exports = User;