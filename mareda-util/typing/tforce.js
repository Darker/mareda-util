/**
 * This file contains functions that are no-op but enforce some kind of typing.
 * 
 * This is mostly to get rid of various meaningless red squiggles in IDE
 */


/**
 * Use this when passing string literals as arguments and the IDE elides
 * their literal value to string type.
 * 
 * @template {string} T
 * @param {T} instr
 * @returns {T}
 */
function stringLiteral(instr) {
    return instr;
}

/**
 * @type {typeof mtypes.stringLiteralTuple}
 */
function stringLiteralTuple(t) {
    return t;
}

/**
 * This is handy if your function has a tempalted bool arg, but also
 * the bool arg has a default.
 * 
 * Normally you get this error: 
 *     'boolean' is assignable to the constraint of type 'TResultBool',
 *     but 'TResultBool' could be instantiated with a different
 *     subtype of constraint 'boolean'.
 * 
 * With this, it disappears.
 * 
 * Usage:
 * 
 * 
 * @template {boolean} TBool
 * @param {TBool} boolVal 
 * @returns {TBool}
 */
function extendsBool(boolVal) {
    return boolVal;
}

export const tforce = {
    stringLiteral, extendsBool, stringLiteralTuple
};