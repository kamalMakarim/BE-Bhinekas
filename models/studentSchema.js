const Extracurricular = require('./extracurricularSchema');

/**
 * Student class
 * @class Student
 * 
 */
class Student {

    /**
     * Constructor for Student class
     * @param {number} id - Student ID
     * @param {string} name - Student name
     * @param {Kelas} classObject - Class object
     * @param {number} parent_id - Parent ID
     * @param {number} batch - Batch
     * @param {boolean} special_needs - Special needs
     * @param {Extracurricular} extracurriculars - Extracurriculars
     */
    constructor(id , name,classObject, parent_id, batch, special_needs, extracurriculars) {
        this.student_id = id;
        this.name = name;
        this.student_class = classObject;
        this.parent_id = parent_id;
        this.batch = batch;
        this.special_needs = special_needs;
        this.extracurriculars = extracurriculars;
    }
}

module.exports = Student;