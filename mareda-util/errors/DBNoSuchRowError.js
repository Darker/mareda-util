import isNonEmptyString from "../strings/isNonEmptyString.js";

class DBNoSuchRowError extends Error {
    /**
     * @param {string} table 
     * @param {string|number|bigint|IDBValidKey} key 
     * @param {object} [param1]
     * @param {ErrorOptions} [param1.options]
     * @param {string} [param1.message] override default message
     */
    constructor(key, table, {options=null, message= ""}={}) {
        super(
            isNonEmptyString(message) ? message : `No record with key ${key} in ${table}`,
            options
        );
        this.key = key;
        this.table = table;
    }
};

export default DBNoSuchRowError;