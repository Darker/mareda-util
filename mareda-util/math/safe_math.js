/**
 * @template {number|bigint} TRes
 * @param {TRes} num 
 * @returns {TRes}
 */
function abs(num) {
    if(num >= 0) {
        return num;
    }
    else {
        // @ts-ignore
        return typeof num == "bigint" ? -1n*num : -1*num;
    }
}

/**
 * @template {number|bigint} TRes
 * @param {TRes} type_to_match 
 * @param {number|bigint} value_to_cast 
 * @returns {TRes} second argument cast to the first argument's number type
 */
function match_type(type_to_match, value_to_cast) {
    const tgt_t = typeof type_to_match;
    if(tgt_t != typeof value_to_cast) {
        if(tgt_t == "bigint") {
            // @ts-ignore
            return BigInt(value_to_cast);
        }
        else {
            // @ts-ignore
            return Number(value_to_cast);
        }
    }
    else {
        // @ts-ignore
        return value_to_cast;
    }
}
/**
 * Contains functions that are safe to use with both int and bigint
 */
const safe_math = {
    abs, match_type
};
export default safe_math;