import safe_math from "../math/safe_math.js";

/**
 * If bigintMath is set, bigint is used for most of the calculation. This means
 * no decimals, but also works for values beyond 2^256
 * 
 * Without bigint math, input is cast to number and decimals will be always available.
 * @template {bigint|number} TNum
 * @param {TNum} number 
 * @returns {{num: number, suffix: string}}
 */
export default function numberToMagnitude(number, {useUnicode=true, bigintMath=false}={}) {
    const magnitude = bigintMath ? safe_math.abs(number) : Math.abs(Number(number));
    if(magnitude >= 1 && magnitude < 1000) {
        return {num: Number(number), suffix: ""};
    }
    if(magnitude == 0) {
        return {num: 0, suffix: ""};
    }
    const units = ['m', useUnicode ? 'μ' : "u", 'n', 'p', 'f', 'a', 'z', 'y'];
    const bigUnits = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

    const order = Math.floor(Math.log10(Number(magnitude)) / 3);
    let normalizedNum = 0;
    let unit = "";

    if (order >= 1) {
        unit = bigUnits[order - 1];
        normalizedNum = magnitude / safe_math.match_type(magnitude, Math.pow(10, order * 3));
    } else {
        unit = units[-order - 1];
        normalizedNum = magnitude * safe_math.match_type(magnitude, Math.pow(10, order * (-3)));
    }

    return { num: Number(normalizedNum), suffix: unit };
}