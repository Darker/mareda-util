import { tforce } from "../typing/tforce.js";


/**
 * @template TItem
 * @param {TItem[] | Iterable<TItem>} iterable
 * @returns {Generator<readonly [number, TItem]>}
 */
function * enumerate(iterable) {
    let i = 0;
    for(const x of iterable) {
        yield [i, x];
        ++i;
    }
}

/**
 * @template {number | bigint} TNum
 * @param {number} num 
 * @param {TNum} ref 
 * @returns {TNum}
 */
function matchType(num, ref) {
    if(typeof ref == "bigint") {
        // @ts-ignore
        return BigInt(num);
    }
    else {
        // @ts-ignore
        return num;
    }
}

/**
 * @template {number | bigint} TNumber
 * @param {TNumber} fromInclusive 
 * @param {TNumber} toExclusive 
 * @param {TNumber} step 
 */
function * range(fromInclusive, toExclusive, step = matchType(1, toExclusive)) {
    let cur = fromInclusive;
    while(cur < toExclusive) {
        yield cur;
        // @ts-ignore
        cur = step + cur;
    }
}

export const itertools = {
    enumerate, range
};