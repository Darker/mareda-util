
/** @type {string[]} **/
const byteToHex = [];

for (let n = 0; n <= 0xff; ++n)
{
    const hexOctet = n.toString(16).padStart(2, "0").toUpperCase();
    byteToHex.push(hexOctet);
}

Object.freeze(byteToHex);

/**
 * 
 * @param {Uint8Array | ArrayBuffer} bytes 
 * @returns 
 */
export default function bytes2hex(bytes)
{
    if(bytes instanceof ArrayBuffer) {
        bytes = new Uint8Array(bytes);
    }

    const hexOctets = [];
    hexOctets.length = bytes.length;

    for (let i = 0; i < bytes.length; ++i)
        hexOctets[i] = byteToHex[bytes[i]];

    return hexOctets.join("");
}