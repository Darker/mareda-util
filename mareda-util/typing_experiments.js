import LazyGenerator from "./iterators/LazyGenerator.js";

/**
 * @template TItem
 * @param {Iterable<TItem>} items
 * @returns {TItem}
 */
function getIterableType(items) {}

/**
 * @template TIterable
 */
class GetIterableTypeHelper {
    static getIterableTypeInner() {
        /** @type {TIterable} **/
        const theIterable = null;
        return getIterableType(theIterable);
    }

    static itemType = GetIterableTypeHelper.getIterableTypeInner();

    /**
     * 
     * @param {TIterable} iterable 
     */
    constructor(iterable) {
        this.itemTypeV = getIterableType(iterable);
    }
}

/**
 * @template TIterable
 * @typedef {ReturnType<typeof getIterableType<TIterable>>} IterableItemDesc
 */

/**
 * @template {Iterable} TIterable
 * @typedef {Object} IterableItemDescTwo
 * @prop {ReturnType<getIterableType<TIterable>>} valueType
 */

/** @type {IterableItemDesc<Iterable<{a:number}>>} **/
const test = null;

/** @type {ReturnType<typeof getIterableType(Iterable<{a:number}>)>} **/
const test2 = null;

function returnTrue() {
    return true;
}

/**
 * @template TIteratorItem
 * @param {IteratorExample<Iterable<TIteratorItem>>} thisArg
 * @returns {IteratorExample<TIteratorItem>}
 */
function flatTypeWrap(thisArg) {
    return thisArg;
}

/**
 * @template TItem
 */
class IteratorExample {
    /**
     * @template TResult
     * @param {(input: TItem)=>TResult} mapFn
     * @returns {IteratorExample<TResult>}
     */
    map(mapFn) {
        // here would be a call to add a map step of the chain of steps to apply
        // to the incoming values
        return this;
    }
    /**
     * TItem here is assumed to be an iterable
     * if it is not the code will still work though, since we delegate the type hinting to the callback
     * @template TResult
     * @param {(items:TItem)=>Iterator<TResult>} mapper
     * @returns {IteratorExample<TResult>}
     */
    flatMap(mapper) {
        // here would be code that adds step that converts all previous items
        // to generator and yields the results individually using the mapper
        return this;
    }
    /**
     * Here I am stuck. If there is no callback I have nowhere to get the type
     */
    flat() {
        // I obviously don't want the solution to have runtime impact
        // or be code at all. But this was my best attempt and it still does not work

        /** @type {TItem} **/
        const item = null;
        const iteratorType = getIterableType(item);
        /** @type {IteratorExample<typeof iteratorType>} **/
        const res = this;
        return res;
    }

    flatV2() {
        /** @type {IteratorExample<TItem>} **/
        const thisArg = this;
        return flatTypeWrap(thisArg);
    }
    /**
     * 
     * @returns {IteratorExample<IterableEntryType<TItem>>}
     */
    flatV3() {
        // @ts-ignore
        return this;
    }
}
/** @type {IteratorExample<number>} **/
const start = new IteratorExample();
const flatMapResults = start.map(x=>[x,x]).flatMap(x=>x[Symbol.iterator]());
const flatResults = start.map(x=>[x,x]).flat();
const flatResultsV2 = start.map(x=>[x,x]).flatV2();
const flatResultsV3 = start.map(x=>[x,x]).flatV3();
const flattened = flatTypeWrap(start.map(x=>[x,x]));
/**
 * @type {ReturnType<returnTrue<number>>}
 */
const test3 = null;




/**
 * @template TRet
 * @returns {TRet}
 */
function returnT() {

}

/**
 * @type {ReturnType<typeof returnT<Console>>}
 */
const test4 = null;
const arrayValue = [1,2,3];
const arrayType = getIterableType(arrayValue);


/** @type {IterableEntryType<typeof arrayValue>} **/
const iteratorResultType = null;


/** @type {NonNullable<number>} **/
const test5 = null;

const gen = LazyGenerator.create("123").flat();

/**
 * @template {true|false} [VReturnsNumber=true]
 * @param {VReturnsNumber} returnsNumber 
 * @returns {TypeChoice<VReturnsNumber, number, string>}
 */
function returnByChoice(returnsNumber = true) {
    // @ts-ignore
    return null;
}

const shouldBeNumber = returnByChoice(true);
const shouldBeString = returnByChoice(false);
// Actual hint: const shouldAlsoBeNumber: string | number
const shouldAlsoBeNumber = returnByChoice();

const shouldBeErrorType = returnByChoice(5);