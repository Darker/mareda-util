import ResolvablePromise from "../ResolvablePromise.js";

class SimpleMutex {
    constructor() {
        /** @type {ResolvablePromise[]} **/
        this.queue = [];
        this.id = 0;
    }

    get isLocked() {
        return this.queue.length > 0;
    }

    async waitUnlocked() {
        while(this.isLocked) {
            const curLastPromise = this.queue[this.queue.length - 1];
            //console.log("Waiting for unlock queue.length = "+this.queue.length + " fulfilled = "+curLastPromise.fulfilled);
            await curLastPromise.get();
        }
    }

    /**
     * @template TRet
     * @param {()=>Promise<TRet>} callback 
     */
    async locked(callback) {
        const myTurn = new ResolvablePromise();
        
        this.queue.push(myTurn);
        //console.log("Added to queue: ", this.queue.length)
        if(this.queue.length > 1) {
            const prev = this.queue[this.queue.length-2];
            await prev.get();
        }

        try {
            return await callback();   
        }
        finally {

            myTurn.resolve();
            // it should be at the beginning now, since we resolve in the correct order
            if(this.queue[0] != myTurn) {
                const index = this.queue.findIndex(x=>x==myTurn);
                this.queue.splice(index, 1);
            }
            else {
                this.queue.shift();
            }
        }
    }
};

export default SimpleMutex;