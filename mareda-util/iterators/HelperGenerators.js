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