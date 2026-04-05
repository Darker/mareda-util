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
 * If you just return [2, "bla"], for example, type system
 * collapses that to (string|number)[]
 * @type {typeof mtypes.tuple2}
 */
function tuple2(t1, t2) {
    return [t1, t2];
}

/**
 * @type {typeof mtypes.tuple3}
 */
function tuple3(t1, t2, t3) {
    return [t1, t2, t3];
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


/**
 * Used to force cast a partial variant of an object
 * to non partial. Use at your own risk
 * 
 * @template {object} T
 * @param {Partial<T>} partialVal 
 * @returns {T}
 */
function unpartial(partialVal) {
    // @ts-ignore
    return partialVal;
}

export const tforce = {
    stringLiteral, extendsBool, stringLiteralTuple, tuple2, tuple3, unpartial
};