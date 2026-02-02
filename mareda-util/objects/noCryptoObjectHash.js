import stringArrayCompare from "../strings/stringArrayCompare.js";
import noCryptoStringHash from "../strings/noCryptoStringHash.js";
/**
 * 
 * @param {Object} cls 
 * @returns {bigint}
 */
function noClassHashFunction(cls) {
    throw new TypeError("Non primitive class instance found cls="+cls.constructor.name);
}

/**
 * This exists because I don't want a Date object hash equal
 * a number with the same value as the date timestamp and so on.
 */
export const PRIMITIVE_TYPE_HASH_BASES = {
    "string": 1823n,
    "number": 6551n,
    "bigint": 2843n,
    "date": 2903n,
    "undefined": 48683343337n,
    "null": 63283531n,
    "object": 3220901n
};

const STD_TYPE_HASH_BASES = {
    "Array": 69815771n,
    "RegExp": 60497n
};
// since all stuff here is done in sync, I can reuse a single instance to convert
// number type, which is float64, to bytes
const FLOAT_PARSER_ARRAY = new Float64Array(1);
const FLOAT_PARSER_BYTES = new Uint32Array(FLOAT_PARSER_ARRAY.buffer);

/**
 * Abuses typed array to convert 4 byte float to 2 32bit ints
 * @param {number} num 
 */
function noCryptoNumberHash(num) {
    FLOAT_PARSER_ARRAY[0] = num;
    return (BigInt(FLOAT_PARSER_BYTES[0]) ^ BigInt(FLOAT_PARSER_BYTES[1]))
}

/**
 * 
 * @param {any} obj 
 * @param {object} param1 
 * @param {Console} [param1.cons]
 * @param {(classInst: Object)=>bigint} [param1.classHasher]
 * @param {number} [param1.maxIterations]
 * @returns 
 */
export default function noCryptoObjectHash(obj, {maxIterations = 500000, classHasher=noClassHashFunction, cons=null}={}) {

    const stack = [{value: obj, key: [], seenItems: []}];
    let hash = 13n;

    /** @type {hashes.ObjectKeyPath[]} **/
    const values = [];

    let safeLimit = 0;

    while(stack.length > 0) {

        const {value, key, seenItems} = stack.pop();
        if(typeof value === "function") {
            throw new TypeError("Cannot hash functions key="+key);
        }
        if(safeLimit++ > maxIterations) {
            throw new Error("Max iterations reached at key="+key.join("."));
        }
        if(cons && safeLimit > 10000 && safeLimit % 5000 === 0) {
            cons.log("Large iteration count "+safeLimit+" at key="+key.join("."));
        }
        if(value instanceof Object) {
            if(seenItems.includes(value)) {
                throw new Error("Circular reference detected key="+key.join("."));
            }
        }

        /** @type {hashes.ObjectKeyPath} **/
        const hashPath = {path: [...key], hash: 0n};
        let valueHash = 0n;
        let hasNested = false;
        let isArray = false;

        if(value === null) {
            valueHash = PRIMITIVE_TYPE_HASH_BASES.null;
        }
        else if(typeof value === "undefined") {
            valueHash = PRIMITIVE_TYPE_HASH_BASES.undefined;
        }
        else if(value instanceof Array) {
            valueHash = STD_TYPE_HASH_BASES.Array;
            hasNested = true;
            isArray = true;
        }
        else if(typeof value === "string") {
            valueHash = noCryptoStringHash(value);
        }
        else if(typeof value === "number") {
            valueHash = noCryptoNumberHash(value) ^ PRIMITIVE_TYPE_HASH_BASES.number;
        }
        else if(typeof value === "bigint") {
            valueHash = value ^ PRIMITIVE_TYPE_HASH_BASES.bigint;
        }
        else if(typeof value === "boolean") {
            valueHash = value ? 977n : 443n;
        }
        else if(typeof value === "function") {
            throw new TypeError("Functions cannot be hashed!");
        }
        else if(typeof value === "object") {
            if(value instanceof Date) {
                valueHash = BigInt(value.getTime()) ^ PRIMITIVE_TYPE_HASH_BASES.date;
            }
            else if(value instanceof RegExp) {
                valueHash = valueHash ^ noCryptoStringHash(value.source);
                valueHash = valueHash ^ STD_TYPE_HASH_BASES.RegExp;
                valueHash = valueHash ^ noCryptoStringHash(value.flags);
                valueHash = valueHash ^ BigInt(value.lastIndex);
            }
            else if(value?.constructor == Object) {
                hasNested = true;
                valueHash = PRIMITIVE_TYPE_HASH_BASES.object;
            }
        }

        hashPath.hash = valueHash;

        if(hasNested) {
            const newSeen = [...seenItems, value];
            if(isArray) {
                for(let i = 0, len = value.length; i < len; i++) {
                    stack.push({value: value[i], key: [...key, i+""], seenItems: newSeen});
                }
            }
            else {
                for(const [k, v] of Object.entries(value)) {
                    stack.push({value: v, key: [...key, k], seenItems: newSeen});
                }
            }
        }

        values.push(hashPath);
    }

    values.sort((a, b)=>{
        return stringArrayCompare(a.path, b.path);
    });
    if(cons) {
        cons.log("Sorted values:");
        cons.log(values);
    }

    /**
     * hashes the paths to individual keys in the object
     * @param {string[]} keyPath 
     */
    function hashKeyPath(keyPath) {
        let keyHash = 17n;
        for(const key of keyPath) {
            keyHash = (keyHash << 16n) - keyHash + noCryptoStringHash(key);
            keyHash = keyHash & 0xFFFFFFFFFFFFFFFFn;
        }
        return keyHash;
    }

    for(const val of values) {
        hash = (hash << 13n) - hash + hashKeyPath(val.path);
        hash = (hash & 0xFFFFFFFFFFFFFFFFn) ^ (hash >> 32n);
        hash = (hash << 13n) - hash + val.hash;
        hash = (hash & 0xFFFFFFFFFFFFFFFFn) ^ (hash >> 32n);
    }
    return hash;
}
