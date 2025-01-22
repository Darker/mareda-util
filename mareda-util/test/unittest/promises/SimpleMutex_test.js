import SimpleMutex from "../../../promises/concurrency/SimpleMutex.js";
import timeoutPromise from "../../../promises/timeoutPromise.js";

class ExecMonitor {
    constructor() {
        this.parallelCalls = 0;
        this.maxParallelCalls = 0;
        this.totalCalls = 0;
    }

    /**
     * @template TRes
     * @param {Promise<TRes>} stuffPromise 
     * @returns {Promise<TRes>}
     */
    async doStuff(stuffPromise) {
        ++this.parallelCalls;
        console.log("Parallel = ", this.parallelCalls);
        ++this.totalCalls;
        this.maxParallelCalls = Math.max(this.parallelCalls, this.maxParallelCalls);
        try {
            return stuffPromise ? await stuffPromise : null;
        }
        finally {
            --this.parallelCalls;
            //console.log("Parallel = ", this.parallelCalls);
        }
    }
}

describe("SimpleMutex test", ()=>{
    it("prevents parallel calls", async ()=>{
        const mon = new ExecMonitor();
        const lock = new SimpleMutex();
        async function callMon() {
            return await lock.locked(async()=>{
                return await mon.doStuff(timeoutPromise(4));
            });
        }
        await Promise.all([callMon(), callMon(), callMon(), callMon()]);
        expect(mon.totalCalls).toBe(4);
        expect(mon.maxParallelCalls).toBe(1);
        expect(mon.parallelCalls).toBe(0);
    });
    it("order is respected", async ()=>{
        const vals = [];
        const lock = new SimpleMutex();
        /**
         * 
         * @param {number} val 
         * @param {number} delay
         */
        async function addVal(val, delay = 15) {
            return await lock.locked(async()=>{
                await timeoutPromise(delay);
                vals.push(val);
                return val;
            });
        }
        const proms = [];
        for(let i = 0; i<5; ++i) {
            proms.push(addVal(i, 13-i));
            await timeoutPromise(1);
        }
        const res = await Promise.all(proms);
        expect(res).toEqual([0,1,2,3,4]);
        expect(vals).toEqual([0,1,2,3,4]);
    });
});