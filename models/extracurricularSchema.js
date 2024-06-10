
/**
 * Extracurricular class
 * @class Extracurricular
 */
class Extracurricular{

    /**
     * Constructor for Extracurricular class
     * @param {string} id - Extracurricular ID
     * @param {string} name - Extracurricular name
     * @param {number} price - Extracurricular price
     */
    constructor(id, name, price){
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

module.exports = Extracurricular;