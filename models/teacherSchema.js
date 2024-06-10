const User = require('./userSchema');
const Kelas = require('./kelasSchema');
/**
 * Teacher class
 * @class Teacher
 */
class Teacher extends User {
    
    /**
     * @param {string} user_id - The user ID
     * @param {string} username - The username
     * @param {string} password - The password
     * @param {string} display_name - The display name
     * @param {string} teacher_id - The teacher ID
     * @param {Kelas} classObject - The class object
     */

    constructor(user_id, username = "", password = "", display_name, teacher_id, classObject) {
        super(user_id, username, password, display_name);
        this.teacher_id = teacher_id;
        this.teacher_class = classObject;
    }
}

module.exports = Teacher;