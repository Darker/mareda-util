import hashByteStreamIncremental from "../../../crypto/hashByteStreamIncremental.js";
import iterableUintArray from "../../helpers/iterableUintArray.js";


describe("hashByteStreamIncremental test", ()=>{
    it("hashes small array", async()=>{
        const data = new Uint8Array(1024);
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

        const hash1 = await hashByteStreamIncremental(
            iterableUintArray(data), crypto, {chunkSize: 64}
        );
        const hash2 = await hashByteStreamIncremental(
            iterableUintArray(data, {chunkBase: 128, chunkRandom: 4}), crypto, {chunkSize: 64}
        );

        expect(hash1).toEqual(hash2);

        data[519] = 42;

        const hashAfterChange = await hashByteStreamIncremental(
            iterableUintArray(data), crypto, {chunkSize: 64}
        );
        expect(hashAfterChange).not.toEqual(hash1);
    });
});