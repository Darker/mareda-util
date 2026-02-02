import ResolvablePromise from "../ResolvablePromise.js";
import SimpleMutex from "./SimpleMutex.js";


class RWLock {
    constructor() {
        this.writeMutex = new SimpleMutex();

        this.reads = 0;
        /** @type {ResolvablePromise | null} **/
        this.noReadsPromise = null;
    }

    /**
     * @template {any} T
     * @param {()=>Promise<T>} callback 
     */
    async read(callback) {
        await this.writeMutex.waitUnlocked();

        ++this.reads;
        if(this.noReadsPromise == null || this.noReadsPromise.fulfilled) {
            this.noReadsPromise = new ResolvablePromise();
        }

        try {
            const res = await callback();
            return res;
        }
        finally {
            --this.reads;
            if(this.reads == 0) {
                this.noReadsPromise.resolve();
            }
        }
    }

    async waitNoReads() {
        while(this.reads > 0) {
            await this.noReadsPromise.get();
        }
    }

    /**
     * @template {any} T
     * @param {()=>Promise<T>} callback 
     */
    async write(callback) {
        return await this.writeMutex.locked(async ()=>{
            await this.waitNoReads();
            try {
                return await callback();
            }
            finally {}
        });
    }
};

export default RWLock;