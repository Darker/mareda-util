
/**
 * Splits a data stream into constant chunk sizes. If padLast is true
 * last chunk is padded with zeros to chunkSize. Otherwise, last chunk may
 * be smaller than the rest of the output.
 * 
 * @param {IterableBytes} data 
 * @param {number} chunkSize 
 * @param {object} [param1]
 * @param {boolean} [param1.padLast] if true, last chunk is zero padded to chunkSize
 */
export default async function * stableFileChunks(data, chunkSize, {padLast=false}={}) {

    /** @type {Uint8Array<ArrayBuffer> | null} **/
    let remainder = null;
    for await(const bytes of data) {
        let offset = 0;

        const chunkLen = bytes.length;
        if(remainder) {
            const neededFromNew = chunkSize - remainder.length;
            if(remainder.length + chunkLen > chunkSize) {
                // merge remainder with part of new bytes to
                // create a new chunk
                const merged = new Uint8Array(chunkSize);
                merged.set(remainder);

                // this ensures further reading in the while() starts from
                // where we ended here
                offset = neededFromNew;
                merged.set(bytes.subarray(0, offset), remainder.length);
                remainder = null;

                yield merged;
                
                // fast exit if we consumed exactly all new bytes
                if(offset === chunkLen) {
                    continue;
                }
            }
            else {
                // bytes plus remainder are still too small for even a single chunk
                const merged = new Uint8Array(chunkLen + remainder.length);
                merged.set(remainder);
                merged.set(bytes, remainder.length);
                remainder = merged;
                continue;
            }
        }
        while(offset+chunkSize <= chunkLen) {
            yield bytes.subarray(offset, chunkSize+offset);
            offset += chunkSize;
        }
        if(offset < chunkLen) {
            remainder = bytes.subarray(offset);
        }
        else {
            remainder = null;
        }
    }

    if(remainder) {
        if(padLast) {
            const res = new Uint8Array(chunkSize);
            res.set(remainder);
            yield res;
        }
        else {
            yield remainder;
        }
    }
}