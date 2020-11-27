import * as StringConversion from "../strings/StringConversion.h";

// Helper for parsing numbers as raw bytes
const HASH_HELPER_BUFFER = new ArrayBuffer(8);
// Write double (the number type)
const HASH_HELPER_DOUBLE = new Float64Array(HASH_HELPER_BUFFER);
// Read shorts
const HASH_HELPER_SHORT = new Uint16Array(HASH_HELPER_BUFFER);

function toHash(object) {
    const queue = [object];
    // six bytes is the max that will not alter the exponent and create imprecision
    let hash = 0x12DCBA;

    while (queue.length > 0) {
        const v = queue.unshift();

        // hash value
        if (typeof v == "string") {
            hash += StringConversion.toHash(k);
            hash *= 13;
            hash |= 0;
        }
        else if (typeof v == "number") {
            HASH_HELPER_DOUBLE[0] = v;
            for (let i = 0; i < 4; ++i) {
                hash += HASH_HELPER_SHORT[i];
                hash *= 3;
            }
            hash |= 0;
        }
        else if (typeof v == "object") {
            if (v instanceof Array) {
                for (const val of v) {
                    queue.push(val);
                }
            }
            // just a normal object
            else {
                const pairs = Object.entries(v);
                pairs.sort((a, b) => a[0].localeCompare(b[0]));
                for (const [k, v] of pairs) {
                    queue.push(k);
                    queue.push(v);
                }
            }
        }
        
    }
    return hash;
}


export default { toHash };