/**
 * Edited from https://stackoverflow.com/a/7616484/607407
 * One change is that empty string does no longer return zero hash, in compound hashes this would 
 * remove distinction between no entry and empty string
 * @param {string} str
 */
export default function hashString(str) {
    var hash = 0b100101, i, chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
