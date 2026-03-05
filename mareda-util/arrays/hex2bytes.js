
/** @type {{[hex: string]:number}} **/
const hexToByte = {}

for (let n = 0; n <= 0xff; ++n)
{
    const hexOctet = n.toString(16).padStart(2, "0").toUpperCase();
    hexToByte[hexOctet] = n;
}

Object.freeze(hexToByte);

/**
 * 
 * @param {string} bytesHex 
 * @returns 
 */
export default function hex2bytes(bytesHex)
{
    const len = bytesHex.length;
    if(len%2 != 0) {
        throw new Error("Hex string must have an even number of characters.");
    }
    const output = new Uint8Array(len/2);


    for (let i = 0; i < len; i+=2) {
        output[i/2] = hexToByte[bytesHex[i] + bytesHex[i+1]];
    }
    return output;
}