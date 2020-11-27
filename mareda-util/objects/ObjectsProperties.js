
/**
 * 
 * @param {Object} object
 * @param {string[]} fragments Fragments of path to traverse through. If string is provided, 
 *                             it will be split by "." char. The array will be modified in the process
 * @returns {any} It will be undefined if the path does not resolve to valid value
 */
function ResolveObjectPath(object, fragments) {
    if (typeof fragments == "string") {
        fragments = fragments.split(".");
    }

    let objIntermediate = object;

    while (fragments.length > 0) {
        const step = fragments.shift();
        if (typeof objIntermediate[step] != "undefined") {
            objIntermediate = objIntermediate[step];
        }
        else {
            // returns undefined, as opposed to null
            return;
        }
    }

    return objIntermediate;
}

export default { ResolveObjectPath };