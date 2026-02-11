import { IS_TYPE_CHECKING } from "./isTypeChecking.js";


/**
 * Extracts a field from the prototype chain of a class.
 * 
 * The purpose is checking if class implements a method, including inheritance.
 * This therefore expects the CLASS as first arg, not an instance
 * 
 * @template {abstract new (...args: any) => any} TClassType
 * @template {keyof InstanceType<TClassType>} TClassKey
 * @param {TClassType} classType 
 * @param {TClassKey} name 
 * @param {mtypes.typeofTypes | "any"} requiredType
 * @returns {InstanceType<TClassType>[TClassKey]}
 */
export default function getFieldInherited(classType, name, requiredType = "any") {
    let currentPrototype = classType.prototype;
    while(currentPrototype && !Object.hasOwn(currentPrototype, name)) {
        currentPrototype = Object.getPrototypeOf(currentPrototype);
    }
    if(typeof currentPrototype != "object" || typeof currentPrototype[name] == "undefined") {
        return undefined;
    }
    if(requiredType != 'any') {
        if(typeof currentPrototype[name] != requiredType) {
            return undefined;
        }
    }
    return currentPrototype[name];
}

if(IS_TYPE_CHECKING) {
    class TestCls extends Error{
        constructor() {
            super();
            this.testVal = 50;
        }
    }
    const inherited = getFieldInherited(TestCls, "testVal");
    const own = getFieldInherited(TestCls, "message");
}