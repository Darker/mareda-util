
/**
 * 
 * @returns {BigInt} random UUID RFC 4122 as a big int
 */
function newBigint() {
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
/**
 * 
 * @param {bigint} bi 
 * @returns 
 */
function bigintToStr(bi) {
  // 1. Convert to hex without the "0x"
  let hex = bi.toString(16);

  // 2. Pad to full 32 hex chars (128 bits)
  hex = hex.padStart(32, "0");

  // 3. Insert UUID hyphens
  return (
    hex.slice(0, 8) + "-" +
    hex.slice(8, 12) + "-" +
    hex.slice(12, 16) + "-" +
    hex.slice(16, 20) + "-" +
    hex.slice(20)
  ).toLowerCase();
}

/**
 * Converts a UUID string (with or without dashes) into a bigint.
 *
 * @param {string} uuidStr
 * @returns {bigint}
 */
function strToBigint(uuidStr) {
  if (typeof uuidStr !== "string") {
    throw new TypeError("UUID must be a string");
  }

  // Remove dashes if present
  const hex = uuidStr.replace(/-/g, "");

  // Validate length (128-bit UUID → 32 hex chars)
  if (hex.length !== 32 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new TypeError("Invalid UUID string format: "+uuidStr);
  }

  return BigInt("0x" + hex);
}


const uuid = {
    bigintToStr, newBigint, strToBigint
};
export default uuid;


