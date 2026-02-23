import stableFileChunks from "../../../iterators/stableFileChunks.js";
import iterableUintArray from "../../helpers/iterableUintArray.js";


describe("stableFileChunks test", ()=>{
    it("splits basic array", async()=>{
        const data = new Uint8Array(256);
        const chunkSize = 32;
        const countExpected = data.length / chunkSize;

        // ref value
        const dataRef = new Uint8Array(chunkSize);

        for(let i=0; i<chunkSize; ++i) {
            dataRef[i] = i;
        }

        for(let i=0; i<countExpected; ++i) {
            const off = i*32;
            data.set(dataRef, off);
        }

        const stream = iterableUintArray(data, {chunkBase: 8, chunkRandom:4});
        let count = 0;
        for await(const chunk of stableFileChunks(stream, chunkSize, {padLast: true})) {
            expect(chunk.length).toEqual(chunkSize);
            expect(chunk).toEqual(dataRef);
            ++count;
        }
        expect(count).toEqual(countExpected);
        
    });
});