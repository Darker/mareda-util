import ConditionVariable from "../promises/concurrency/ConditionVariable.js";

const UNIQUE_NOTHING = Object.freeze({});
const EOF_HELPER = Object.freeze({});

/**
 * 
 * @returns {unique symbol}
 */
function uniqueSymbol() {
    return Symbol("asyncDispose");
}

/** @type {unique symbol} **/
const polyfill = Symbol("asyncDispose");

/** @type {typeof Symbol.asyncDispose} **/
// @ts-ignore
const disposeSymbol = typeof Symbol.asyncDispose == "symbol" ? Symbol.asyncDispose : polyfill;


/**
 * @template TVal
 * @extends {AsyncIterator<TVal, TVal, any>}
 */
class WritableAsyncIterator {
    /**
     * Write this value to close the stream.
     * @type {object}
     * @readonly
     * @static
     */
    static EOF = EOF_HELPER;

    constructor() {
        /** @type {TVal} **/
        // @ts-ignore
        this.currentData = UNIQUE_NOTHING;

        this.dataAvailVar = new ConditionVariable();
        this.dataNeededVar = new ConditionVariable();

        this.closedFromReturn = false;
        /** @type {Error} **/
        this.closedWithError = null;
        this.reportedDone = false;
    }

    /**
     * @param {TVal | typeof WritableAsyncIterator.EOF} data
     */
    async write(data) {
        while(true) {
            if(this.currentData === WritableAsyncIterator.EOF || this.reportedDone) {
                throw new Error("Stream closed.");
            }
            if(this.closedFromReturn) {
                throw new Error("Stream closed by return().");
            }
            if(this.currentData === UNIQUE_NOTHING) {
                // @ts-ignore
                this.currentData = data;
                this.dataAvailVar.wakeOne();
                return;
            }
            await this.dataNeededVar.wait();
        }
    }

    /**
     * 
     * @returns {Promise<IteratorResult<TVal>>}
     */
    async next() {
        if(this.reportedDone || this.closedFromReturn) {
            if(this.closedWithError) {
                const err = this.closedWithError;
                this.closedWithError = null;
                throw err;
            }
            throw new Error("Stream done!");
        }
        while(true) {
            /** @type {TVal} **/
            // @ts-ignore
            let retVal = UNIQUE_NOTHING;

            if(this.currentData !== UNIQUE_NOTHING) {
                retVal = this.currentData;
                if(retVal != WritableAsyncIterator.EOF) {
                    // @ts-ignore
                    this.currentData = UNIQUE_NOTHING;
                }
            }

            this.dataNeededVar.wakeOne();

            if(retVal === UNIQUE_NOTHING) {
                await this.dataAvailVar.wait();
                continue;
            }

            if(retVal === WritableAsyncIterator.EOF) {
                this.reportedDone = true;
                // Everyone still waiting to write gets an Error thrown
                this.dataNeededVar.wakeAll();
                return {done: true, value: undefined};
            }
            else {
                return {done: false, value: retVal};
            }
        }
    }

    async return() {
        this.closedFromReturn = true;
        this.dataNeededVar.wakeAll();
        // @ts-ignore
        return {value: null};
    }

    /**
     * 
     * @param {Error} exception 
     */
    async throw(exception) {
        this.closedFromReturn = true;
        this.closedWithError = exception;
        this.dataNeededVar.wakeAll();
        // @ts-ignore
        return {value: null};
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async [disposeSymbol]() {
        return await this.return();
    }
};

Object.defineProperty(WritableAsyncIterator, "EOF", {writable: false, configurable: false, enumerable: false});

export default WritableAsyncIterator;