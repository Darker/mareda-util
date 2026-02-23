import timeoutPromise from "../../promises/timeoutPromise.js";

/**
 * Used to emulate streaming of data
 * @param {Uint8Array<ArrayBuffer>} arr 
 */
export default async function * iterableUintArray(arr, {chunkBase=50, chunkRandom=40}={}) {
    let idx = 0;
    while(idx < arr.length) {
        await timeoutPromise(Math.random()*4+8)
        const chunk = Math.floor(Math.random()*chunkRandom + chunkBase);
        const endOff = Math.min(idx+chunk, arr.length);
        yield arr.slice(idx, endOff);
        idx = endOff;
    }
}