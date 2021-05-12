import * as child_process from "child_process";

/**
 *
 * @param {string} command
 * @param {import('child_process').ExecOptions} options
 * @returns {Promise<{stdout:string,stderr:string}>}
 */
function ExecCp(command, options = {}) {
    return new Promise(function (resolve, reject) {
        const child = child_process.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve({ stdout, stderr });
            }
        });
        if (options.stdoutTarget) {
            child.stdout.pipe(options.stdoutTarget, { end: false });
        }
        if (options.stderrTarget) {
            child.stderr.pipe(options.stderrTarget, { end: false });
        }
    });
}
export default ExecCp;