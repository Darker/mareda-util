import stableFileChunks from "../iterators/stableFileChunks.js";

/**
 * 
 * @param {IterableBytes} byteGenerator 
 * @param {Crypto} crypto - should be WebCrypto API
 * @param {object} [param1]
 * @param {AlgorithmIdentifier} [param1.algorithm] - must be supported by the provisded web crypto instance
 * @param {1} [param1.implementationVersion] - this is for future, in case I decide to change how this works, which would break old hashes
 * @param {number} [param1.chunkSize] - bigger costs more memory, smaller more CPU
 */
export default async function hashByteStreamIncremental(byteGenerator, crypto, {algorithm="SHA-256", chunkSize=1024*512, implementationVersion=1} = {}) {
    // chunk size is part of the hash
    
    let currentHash = new Uint8Array(await crypto.subtle.digest(algorithm, new Uint32Array([chunkSize])));

    const mergeBuffer = new ArrayBuffer(currentHash.byteLength * 2);
    const mergeArray = new Uint8Array(mergeBuffer);

    for await(const chunk of stableFileChunks(byteGenerator, chunkSize)) {
        const intermediateHash = await crypto.subtle.digest(algorithm, chunk);
        //mergeBuffer.resize(currentHash.byteLength + intermediateHash.byteLength);
        mergeArray.set(currentHash);
        mergeArray.set(new Uint8Array(intermediateHash), currentHash.byteLength);

        const mergedHash = await crypto.subtle.digest(algorithm, mergeArray);
        currentHash = new Uint8Array(mergedHash);
    }
    return currentHash;
}
