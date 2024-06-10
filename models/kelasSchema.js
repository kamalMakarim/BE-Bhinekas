/**
 * Kelas class
 * @class Kelas
 */
class Kelas{
    /**
     * Constructor for Kelas class
     * @param {string} id - Class ID
     * @param {string} name - Class name
     * @param {number} year - Class year
     */
    constructor(id, name, year) {
        this.id = id;
        this.name = name;
        this.year = year;
    }
}

module.exports = Kelas;