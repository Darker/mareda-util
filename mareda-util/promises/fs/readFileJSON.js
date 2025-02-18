import fs from "fs";
/**
 * @template TResult
 * @param {string} path 
 * @param {object} [param1]
 * @param {BufferEncoding} [param1.encoding]
 * @param {boolean} [param1.allowNotExist]
 * @param {TResult} [param1.ifNotExist]
 * @returns {Promise<TResult>}
 */
export default async function readFileJSON(path, {ifNotExist = null, allowNotExist=true, encoding="utf8"}={}) {
    try {
        const data = await fs.promises.readFile(path, {encoding});
        return JSON.parse(data);
    }
    catch(e) {
        if(e.code == "ENOENT" && allowNotExist) {
            return ifNotExist;
        }
        throw e;
    }
}