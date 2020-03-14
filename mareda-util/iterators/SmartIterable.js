
///**
// * @typedef {Object} IterablePredicate - return true if given element of iterable matches an internal condition
// */

/**
 * @template TIterEntry
 * @typedef {function(TIterEntry):boolean} IterablePredicate - return true if given element of iterable matches an internal condition
 * */

/**
 * @template TIterEntry
 * @template TResult
 * @typedef {function(TIterEntry):TResult} IterableMapper - map old values to new ones
 * */

///**
// * @template TIterEntry
// * @callback IterablePredicate
// * @description return true if given element of iterable matches an internal condition
// * @param {TIterEntry} value the current item being evalueated
// * @returns {boolean} true if the entry satisfies given condition
// * */

/**
 * @template TIter
 * */
class SmartIterable {

    /**
     * Converts array-ish object to iterable.
     * This works with any object that follows these rules:
     *
     *  - `object` has a property `length` which is a positive integer or zero
     *  - for each integer `i` between 0 and `object.length`, there exists a property `object[i]`
     * @template T
     * @param {T[]|HTMLCollectionOf<T>|NodeListOf<T>|{length:number, [name:string]:T}} object
     * @returns {SmartIterable<T>}
     */
    static from(object) {

    }
    /**
     * Creates smart iterable from boring iterable
     * @param {IterableIterator<TIter>} normalIterable pass null and override iterator if you have different means of iteration
     */
    SmartIterable(normalIterable) {
        this._iterable = normalIterable;
    }

    *[Symbol.iterator]() {
        yield* this._iterable;
    }
    /**
     *
     * @param {IterablePredicate<TIter>} predicate
     * @returns {SmartIterable<TIter>}
     */
    filter(predicate) {
        return new SmartIterable(this.filter(predicate));
    }
    *_filter(predicate) {
        for (const val of this) {
            if (predicate(val)) {
                yield val;
            }
        }
    }
    /**
     * @template TResult
     * @param {IterableMapper<TIter, TResult>} mapper
     * @returns {SmartIterable<TResult>}
     */
    map(mapper) {

    }

    /**
     * @template TResult
     * @param {IterableMapper<TIter, TResult>} mapper
     * @returns {IterableIterator<TResult>}
     */
    *_map(mapper) {

    }
}