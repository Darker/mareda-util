import ResolvablePromise from "../ResolvablePromise.js";

/**
 * @template TResult
 */
class ConditionVariable {
    constructor() {
        /**
         * @type {ResolvablePromise<TResult>[]}
         */
        this.waiters = [];

        // set to true if wake is called when there are no waiters
        // This, however will not cause all subsequently added waits to be
        // awoken, only the first one
        this.wakeValue = null;
        this.alreadyAwoke = false;
    }

    /**
     * 
     * @param {object} [param0] 
     * @param {AbortSignal | null} [param0.abortSignal]
     */
    async wait({abortSignal=null} = {}) {
        if(this.alreadyAwoke && this.waiters.length == 0) {
            this.alreadyAwoke = false;
            const val = this.wakeValue;
            this.wakeValue = null;
            return val;
        }
        /** @type {ResolvablePromise<TResult>} **/
        const promise = new ResolvablePromise(abortSignal);
        this.waiters.push(promise);
        return await promise.get();
    }

    /**
     * 
     * @param {TResult} data 
     */
    wakeOne(data) {
        while(true) {
            if(this.waiters.length == 0) {
                this.wakeValue = data;
                this.alreadyAwoke = true;
                return false;
            }
            
            const next = this.waiters.shift();
            if(!next.aborted) {
                next.resolve(data);
                return true;
            }
        }
    }

    /**
     * 
     * @param {TResult} data 
     */
    wakeAll(data) {
        let len = 0;
        for(const waiter of this.waiters) {
            if(!waiter.aborted) {
                waiter.resolve(data);
                ++len;
            }
        }

        this.waiters.length = 0;
        if(len == 0) {
            this.alreadyAwoke = true;
            this.wakeValue = data;
        }
        return len;
    }
};

export default ConditionVariable;