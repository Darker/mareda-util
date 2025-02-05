/**
 * 
 * @param {string} str 
 * @returns {string} Without any accent characters
 */
export default function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}