import RWLock from "../../../promises/concurrency/RWLock.js";
import timeoutPromise from "../../../promises/timeoutPromise.js";

describe("RWLock test", ()=>{
    it("description", async ()=>{
        let val = 0;
        const lock = new RWLock();

        async function doWrite() {
            const oldVal = val;
            await timeoutPromise(Math.random()*9 + 5);
            expect(oldVal).toEqual(val);
            val = oldVal + 1;
            // console.log(oldVal + " => " + val)
        }

        async function doRead() {
            const oldVal = val;
            await timeoutPromise(Math.random()*8 + 5);
            expect(oldVal).toEqual(val);
            return val;
        }

        async function doWrites() {
            for(let i=0; i<5; ++i) {
                await lock.write(async ()=>{
                    await doWrite();
                });
            }
        }

        async function doReads() {
            let prev = 0;
            for(let i=0; i<5; ++i) {
                await lock.read(async ()=>{
                    const cur = await doRead();
                    expect(cur).toBeGreaterThanOrEqual(prev);
                    prev = cur;
                });
                
            }
        }

        await Promise.all([doReads(),doWrites(),doReads(), doWrites()]);
        expect(val).toEqual(2*5);
    });
});