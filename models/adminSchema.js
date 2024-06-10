const User = require('./userSchema');

/**
 * Admin class
 * @extends User
 * @class Admin
 */
class Admin extends User{
    /**
     * Constructor for Admin class
     * @param {string} user_id - The user ID
     * @param {string} username - The username
     * @param {string} password - The password
     * @param {string} display_name - The display name
     * @param {string} admin_id - The admin ID
     */
    constructor(user_id, username, password, display_name, admin_id){
        super(user_id, username, password, display_name);
        this.admin_id = admin_id;
    }
}

module.exports = Admin;