
/**
 * Returns true if value is non-empty string.
 * Returns true for String instances as well. But I hope that part of the code never gets used.
 * Shorthand for typeof check + length check.
 * @param {any} val 
 * @returns {boolean}
 */
export default function isNonEmptyString(val) {
    return (typeof val=="string" && val.length > 0) || (val instanceof String && val.length > 0);
}