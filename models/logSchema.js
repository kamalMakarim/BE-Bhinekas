class Log{
    /**
     * 
     * @param {String} log_id 
     * @param {Timestamp} created_at 
     * @param {Kelas} kelas 
     * @param {boolean} for_special_kids 
     */
    constructor(log_id, created_at, kelas, for_special_kids){
        this.log_id = log_id;
        this.created_at = created_at;
        this.kelas = kelas;
        this.for_special_kids = for_special_kids;
    }
}

module.exports = Log;