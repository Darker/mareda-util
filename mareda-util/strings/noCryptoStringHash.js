/**
 * NOT FOR CRUPTOGRAPHY
 * Returns a hash code from a string. This is not intended for any crypto stuff!
 * @param  {String} str The string to hash.
 * @return {bigint} 64 bit hash
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export default function noCryptoStringHash(str) {
    let hash = 0n;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = BigInt(str.charCodeAt(i));
        hash = (hash << 5n) - hash + chr;
        hash = hash & 0xFFFFFFFFFFFFFFFFn
    }
    return hash;
}