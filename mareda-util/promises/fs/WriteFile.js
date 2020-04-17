import * as fs from "fs";

/**
 *
 * @param {import("fs").PathLike | string} filename
 * @param {string|Buffer} buffer
 * @param {fs.WriteFileOptions} options
 * @returns {Promise<void>}
 */
function WriteFile(filename, buffer, options) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, buffer, options, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        })
    });
}

export default WriteFile;