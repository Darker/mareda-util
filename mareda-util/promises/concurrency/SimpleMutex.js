import ResolvablePromise from "../ResolvablePromise.js";

class SimpleMutex {
    constructor() {
        this.queue = [];
        this.id = 0;
    }

    /**
     * @template TRet
     * @param {()=>Promise<TRet>} callback 
     */
    async locked(callback) {
        const myTurn = new ResolvablePromise();
        
        this.queue.push(myTurn);
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