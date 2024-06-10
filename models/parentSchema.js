const User = require('./userSchema');
const Student = require('./studentSchema');

/**
 * Parent class
 * @extends User
 * @class Parent
 */
class Parent extends User {
    /**
     * Constructor for Parent class
     * @param {string} user_id - The user ID
     * @param {string} username - The username
     * @param {string} password - The password
     * @param {string} display_name - The display name
     * @param {Array<Student>} students - The students
     * @param {string} parent_id - The parent ID
     */
    constructor(user_id, username, password, display_name, students, parent_id) {
        super(user_id, username, password, display_name);
        this.students = students;
        this.parent_id = parent_id;
    }
}

module.exports = Parent;