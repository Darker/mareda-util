
/**
 * 
 * @returns {BigInt} random UUID RFC 4122 as a big int
 */
export function uuid128() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    // Set version (4) and variant (RFC 4122)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    let value = 0n;
    for (const b of bytes) {
        value = (value << 8n) | BigInt(b);
    }
    return value; // BigInt representing full 128-bit UUID
}
