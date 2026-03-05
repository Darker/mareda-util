import WritableAsyncIterator from "../../../iterators/WritableAsyncIterator.js";
import DeferredPromise from "../../../promises/DeferredPromise.js";
import timeoutPromise from "../../../promises/timeoutPromise.js";


describe("WritableAsyncIterator_test", ()=>{
    it("generates in correct order", async () =>{
        /** @type {WritableAsyncIterator<number>} **/
        const iter = new WritableAsyncIterator();

        /**
         * @type {number[]}
         */
        const valsRead = [];

        /**
         * 
         * @param {WritableAsyncIterator<number>} iterator 
         */
        async function readVals(iterator) {
            for await(const val of iterator) {
                valsRead.push(val);
            }
        }

        const readEnd = new DeferredPromise(readVals(iter));
        await iter.write(0);
        await iter.write(1);
        await iter.write(2);
        await iter.write(WritableAsyncIterator.EOF);

        await readEnd.get();

        expect(valsRead).toEqual([0,1,2]);
    });

    it("stops iteration on return() and wakes writers", async () => {
        const iter = new WritableAsyncIterator();

        /** @type {number[]} **/
        const valsRead = [];

        /**
         * @param {WritableAsyncIterator<any>} iterator
         */
        async function readVals(iterator) {
            for await (const val of iterator) {
                valsRead.push(val);
                if (val === 1) {
                    break;
                }
            }
        }

        const readEnd = new DeferredPromise(readVals(iter));

        await iter.write(0);
        await iter.write(1);

        // Writer after return() should throw
        await expectAsync(iter.write(2)).toBeRejectedWithError("Stream closed by return().");

        await readEnd.get();

        expect(valsRead).toEqual([0, 1]);
    });
    it("propagates error from throw() and wakes writers", async () => {
        const iter = new WritableAsyncIterator();
        
         /** @type {number[]} **/
        const valsRead = [];
        const injectedError = new Error("Injected failure");

        /**
         * @param {WritableAsyncIterator<any>} iterator
         */
        async function readVals(iterator) {
            try {
                for await (const val of iterator) {
                    valsRead.push(val);
                    if (val === 1) {
                        await iterator.throw(injectedError);
                    }
                }
            } catch (err) {
                // Should be the same error we injected
                expect(err).toBe(injectedError);
                return;
            }
            throw new Error("Iterator did not throw as expected");
        }

        const readEnd = new DeferredPromise(readVals(iter));

        await iter.write(0);
        await iter.write(1);

        // Writer after throw() should throw
        await expectAsync(iter.write(2)).toBeRejectedWithError("Stream closed by return().");

        await readEnd.get();

        expect(valsRead).toEqual([0, 1]);
    });

    it("handles parallel writers correctly", async () => {
        const iter = new WritableAsyncIterator();
        
        /** @type {string[]} **/
        const valsRead = [];

        /**
         * @param {AsyncIterableIterator<string>} iterator
         */
        async function readVals(iterator) {
            for await (const val of iterator) {
                valsRead.push(val);
                await timeoutPromise(6 + Math.random()*5);
            }
        }

        // Even when async, all writes should still come in the same order
        /** @type {string[]} **/
        const valsWritten = [];

        /**
         * @param {WritableAsyncIterator<string>} iterator
         * @param {number} count
         * @param {string} val
         */
        async function writeVals(iterator, count, val) {
            for(let i=0; i<count; ++i) {
                await iterator.write(val);
                valsWritten.push(val);
                await timeoutPromise(3 + Math.random()*4);
            }
        }

        const readEnd = new DeferredPromise(readVals(iter));

        const writeCount = 5;
        await Promise.all([
            writeVals(iter, writeCount, "A"),
            writeVals(iter, writeCount, "B"),
            writeVals(iter, writeCount, "C"),
        ]);

        await iter.write(WritableAsyncIterator.EOF);

        await readEnd.get();

        expect(valsRead.length).toBe(3*writeCount);
        expect(valsRead.length).toBe(valsWritten.length);

        expect(valsRead).toEqual(valsWritten);
    });
});