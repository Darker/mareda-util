
/**
 * If you just store a promise in a variable and it rejects,
 * node.js will exit. It was warning about that for years, and now it's real.
 * 
 * This wrapper awaits the promise immediatelly and stores the error/result for later retrieval.
 * @template TResult
 */
class DeferredPromise {
    /**
     * 
     * @param {Promise<TResult>} internalPromise 
     */
    constructor(internalPromise) {
        this.error = null;
        /** @type {TResult?} **/
        this.result = null;
        this.done = false;
        this.inner = this._awaitPromise(internalPromise);
    }
    /**
     * 
     * @param {Promise<TResult>} promise 
     */
    async _awaitPromise(promise) {
        try {
            this.result = await promise;
        }
        catch(e) {
            this.error = e;
        }
        finally {
            this.done = true;
            this.inner = null;
        }
    }

    async get() {
        if(!this.done) {
            await this.inner;
        }

        if(this.error) {
            throw this.error;
        }
        else {
            return this.result;
        }
    }
};

export default DeferredPromise;