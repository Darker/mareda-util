import ResolvablePromise from "../ResolvablePromise.js";

class ReentryHook {
    /**
     * 
     * @param {number} id 
     * @param {string} stack
     */
    constructor(id, stack = "") {
        this.id = id;
        this.stack = stack
        Object.freeze(this);
    }
}

class SimpleMutex {
    constructor(allowReentry = true, debugLock = false) {
        /** @type {ResolvablePromise<any>[]} **/
        this.queue = [];
        this.reentryId = 0;
        /** @type {ReentryHook} **/
        this.reentryHook = null;

        this.allowReentry = allowReentry;
        this.debugLock = debugLock;
        /**
         * @type {string[]}
         */
        this.stackQueue = [];
    }

    get isLocked() {
        return this.queue.length > 0;
    }

    /**
     * Execute an operation when it's guaranteed the lock is unlocked
     * @param {()=>void} callback 
     */
    async onUnlocked(callback) {
        while(true) {
            if(this.isLocked) {
                const curLastPromise = this.queue[this.queue.length - 1];
                //console.log("Waiting for unlock queue.length = "+this.queue.length + " fulfilled = "+curLastPromise.fulfilled);
                await curLastPromise.get();
            }

            if(!this.isLocked) {
                callback();
                return;
            }
        }
    }

    /**
     * @template TRet
     * @param {(reentryHook: object)=>Promise<TRet>} callback 
     * @param {object} [param1]
     * @param {object} [param1.reentryHook]
     */
    async locked(callback, {reentryHook = null} = {}) {
        if(this.allowReentry && reentryHook && this.reentryHook === reentryHook) {
            return await callback(reentryHook);
        }

        let myStack = "";
        if(this.debugLock) {
            myStack = new Error("").stack;
            this.stackQueue.push(myStack);
        }

        const myTurn = new ResolvablePromise();
        
        this.queue.push(myTurn);
        //console.log("Added to queue: ", this.queue.length)
        if(this.queue.length > 1) {
            const prev = this.queue[this.queue.length-2];
            await prev.get();
        }

        try {
            if(this.allowReentry) {
                this.reentryHook = new ReentryHook(++this.reentryId, myStack);
            }
            return await callback(this.allowReentry ? this.reentryHook : null);
        }
        finally {
            this.reentryHook = null;
            myTurn.resolve();
            // it should be at the beginning now, since we resolve in the correct order
            if(this.queue[0] != myTurn) {
                const index = this.queue.findIndex(x=>x==myTurn);
                this.queue.splice(index, 1);
                if(this.debugLock) {
                    this.stackQueue.splice(index, 1);
                }
            }
            else {
                this.queue.shift();
                if(this.debugLock) {
                    this.stackQueue.shift();
                }
            }
        }
    }
};

export default SimpleMutex;