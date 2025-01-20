/**
 * Compares two arrays of string the same way a single pair of strings would be compared
 * 
 * Intended for sorting arrays of components - for example array of strings that
 * represent file path split by the separator
 * 
 * The difference is, here ["a", "b", "c"] does not equal ["a", "bc"]
 * @param {string[]} a 
 * @param {string[]} b 
 */
export default function stringArrayCompare(a, b) {
    const l1 = a.length;
    const l2 = b.length;
    const minLen = Math.min(l1, l2);

    for(let i = 0; i < minLen; i++) {
        const cmp = a[i].localeCompare(b[i]);
        if(cmp !== 0) {
            return cmp;
        }
    }

    if(l1 < l2) {
        return -1;
    }
    else if(l1 > l2) {
        return 1;
    }
    return 0;
}