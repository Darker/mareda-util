/**
 * @package
 * @private
 * @param {number|bigint} number
 * @param {number} digits
 */
export function padNum(number, digits, {noexcept = false, padding = "0", ifInvalid=""}={}) {
    const isBigint =  typeof number == "bigint";
    function nothing() {
        if(noexcept) {
            return ifInvalid.padStart(digits);
        }
        else {
            throw new TypeError("Not a number: "+number);
        }
    }
    if(typeof number != "number" && !isBigint) {
        return nothing();
    }
    if(!isBigint && !Number.isFinite(number)) {
        return nothing();
    }
    return number.toString().padStart(digits, padding);
}