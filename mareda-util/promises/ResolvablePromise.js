/**
 * Simple promise wrapper that allows you to resolve or reject a promise later.
 * 
 * @template TResult
 */
class ResolvablePromise {
    /**
     * 
     * @param {AbortSignal} [abortSignal]
     */
    constructor(abortSignal) {
        /** @type {Promise<TResult>} do not await directly, use get() **/
        this.inner = new Promise((resolve, reject)=>{
            this._resolve = resolve;
            this._reject = reject;
        });
        this.resolved = false;
        this.rejected = false;
        this.aborted = false;
        /** @type {TResult|Error} **/
        this.value = null;

        if(abortSignal) {
            this.abortSignal = abortSignal;
            this._abortListener = ()=>{
                this.aborted = true;
                this.reject(this.abortSignal.reason);
            };
            abortSignal.addEventListener("abort", this._abortListener);
        }
        
        // Tracks listeners for the purpose of quiet destruction
        // if nothing is listening on the promise, reject on the inner is not called
        // when destroy() occurs
        this.listenerCount = 0;
    }
    get fulfilled() {
        return this.resolved || this.rejected;
    }
    removeAbort() {
        if(this.abortSignal) {
            this.abortSignal.removeEventListener("abort", this._abortListener);
            delete this.abortSignal;
            delete this._abortListener;
        }
    }
    /**
     * Resolve this promise with given value
     * @param {TResult} value 
     */
    resolve(value, override = false) {
        this.removeAbort();

        if(this.fulfilled) {
            if(override) {
                this.value = value;
                this.resolved = true;
                this.rejected = false;
            }
            else {
                throw new Error("Promise already fulfilled, cannot resolve");
            }
        }
        else {
            this._resolve(value);
            this.value = value;
            this.resolved = true;
        }
    }
    /**
     * 
     * @param {Error} exception 
     * @param {boolean} override 
     */
    reject(exception, override = false) {
        this.removeAbort();

        if(this.fulfilled) {
            if(override) {
                this.value = exception;
                this.resolved = false;
                this.rejected = true;
            }
            else {
                throw new Error("Promise already fulfilled, cannot reject");
            }
        }
        else {
            this._reject(exception);
            this.value = exception;
            this.rejected = true;
        }
    }
    /**
     * This is similar to reject, however will do nothing if nothing is awaiting the
     * promise at this moment. This allows cancellation of ResolvablePromise
     * without encountering unhandled exception error.
     * @param {Error} destroyError 
     */
    destroy(destroyError) {
        this.removeAbort();
        if(!this.fulfilled) {
            this.rejected = true;
            this.value = destroyError;
            if(this.listenerCount > 0) {
                // kick out any listeners with an error
                this._reject(destroyError);
            }
            this.inner = null;
        }
    }
    async get() {
        if(this.resolved) {
            return this.value;
        }
        else if (this.rejected) {
            throw this.value;
        }
        else {
            ++this.listenerCount;
            try {
                return await this.inner;
            }
            finally {
                --this.listenerCount;
            }
        }
    }
}

export default ResolvablePromise;