/**
 * Converts array-ish object to iterable.
 * This works with any object that follows these rules:
 *
 *  - `object` has a property `length` which is a positive integer or zero
 *  - for each integer `i` between 0 and `object.length`, there exists a property `object[i]`
 * @template T
 * @param {T[]|HTMLCollectionOf<T>|NodeListOf<T>|{length:number, [name:string]:T}} object
 * @returns {IterableIterator<T>}
 */
function* toIterable(object) {
    const l = object.length;
    for (let i = 0; i < l; ++i) {
        yield object[i];
    }
}

/**
 * Returns iterator over items that were removed from the source array based on the predicate
 * 
 * @template T
 * @param {T[]} data
 * @param {function(T):boolean} predicate return true for items you want to remove
 * @returns {IterableIterator<T>}
 * 
 * */
function* spliced(data, predicate) {
    for (let i = 0, l = data.length; i < l; ++i) {
        const item = data[i];
        if (predicate(item)) {
            data.splice(i);
            i--;
            l--;
            yield item;
        }
    }
}

/**
 * @description Finds max value that is maximal according to the max calculator given in second argument
 * @template T
 * @param {Iterable<T>|T[]} iterable collection of items to search in
 * @param {function(T):number} calculator function that translates value to number
 * @param {boolean} returnIndex true if index should be returned instead of entry
 * @returns {T|number} Index of the max item or -1
 */
function findMaxFunction(iterable, calculator, returnIndex = false, reverse = false) {
    if (typeof calculator !== "function") {
        throw new Error("findMaxIndex: Calculator must be given and must be function!");
    }
    let max = -Infinity;
    let maxItemIndex = -1;
    let maxItem = null;
    const multiplier = reverse ? -1 : 1;
    let index = 0;
    for (const item of iterable) {
        const itemValue = multiplier * calculator(item);
        if (typeof itemValue !== "number") {
            throw new Error("findMaxIndex: Calculator callback must return number!");
        }
        if (max < itemValue) {
            max = itemValue;
            maxItemIndex = index;
            maxItem = item;
        }
        ++index;
    }
    return returnIndex ? maxItemIndex : maxItem;
}
/**
 * @description Finds max value that is maximal according to the max calculator given in second argument
 * @template T
 * @param {Iterable<T>|T[]} iterable collection of items to search in
 * @param {function(T):number} calculator function that translates value to number
 * @returns {T|null} max item or null
 */
function findMax(iterable, calculator) {
    return findMaxFunction(iterable, calculator, false, false);
}


/**
 * @template T
 * @param {Iterable<T>} iterableObject
 * @param {function(T):boolean} predicate
 * @returns {IterableIterator<T>}
 */
function* filtered(iterableObject, predicate) {
    for (const value of iterableObject) {
        if (predicate(value)) {
            yield value;
        }
    }
}

/**
 * @template TOrig
 * @template TNew
 *
 * Maps values from iterable.
 *
 * @param {IterableIterator<TOrig>} iterableObject
 * @param {function(TOrig):TNew} mapper
 * @returns {IterableIterator<TNew>}
 */
function* mapped(iterableObject, mapper) {
    for (const value of iterableObject) {
        yield mapper(value);
    }
}
/**
 * Creates numeric range iterator. The iterator will iterate between start and end.
 * Start may be larger than end. The output will contain both start and end, but no value
 * will appear twice.
 * @param {number} start
 * @param {number} end
 * @param {number} step
 * @yields {number}
 * @returns {IterableIterator<number>}
 */
function* numrange(start = 0, end = 100, step = 1) {
    if (start > end) {
        step = -1 * step;
    }

    let i = start;
    for (; shouldLoop(i); i += step) {
        yield i;
        if (i != end && !shouldLoop(i + step)) {
            yield end;
        }
    }

    function shouldLoop(ival) {
        return start > end ? ival >= end : ival <= end;
    }
}

/**
 * Repeats given value as many times as given in count.
 * @param {any} value
 * @param {number} count
 */
function* repeatValue(value, count) {
    while ((count--) > 0) {
        yield value;
    }
}

/**
 * Sums all values provided by the iterator
 * @param {IterableIterator<number>} iterator
 * @returns {number}
 */
function sumIterator(iterator) {
    let sum = 0;
    for (const n of iterator) {
        if (typeof n == "number") {
            sum += n;
        }
        else {
            throw new TypeError("Some entries are not numbers!");
        }
    }
    return sum;
}

export {
    toIterable,
    filtered,
    mapped,
    numrange,
    repeatValue,
    sumIterator
};