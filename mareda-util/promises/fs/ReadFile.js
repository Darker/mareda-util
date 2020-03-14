import * as fs from "fs";
/**
 *
 * @param {import("fs").PathLike | string} filename
 * @returns {Promise<Buffer>}
 */
function ReadFile(filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, {}, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        })
    });
}

export default ReadFile;