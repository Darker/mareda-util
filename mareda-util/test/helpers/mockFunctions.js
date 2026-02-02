
/**
 * @template TCallback
 * @template TTargetObj
 */
class FunctionMock {
    /**
     * 
     * @param {TCallback} originalFn 
     * @param {TTargetObj} targetHint - not used directly, but hints what the target object type is
     */
    constructor(originalFn, targetHint) {

        this.originalFn = originalFn;
        /** @type {(params: Parameters<TCallback>, mock: typeof this, orig: TCallback, target: TTargetObj)=>ReturnType<TCallback>} **/
        this.overrideFn = null;
        const thisMock = this;
        /** @type {TCallback} **/
        this.wrapper = function(...args) {
            thisMock.functionCalled(args, this);
        }

        this.callCount = 0;
        this.recordCalls = false;
        this.noop = false;
        /** @type {Parameters<TCallback>[]} **/
        this.calls = [];
    }

    /**
     * @param {Parameters<TCallback>} args
     * @param {TTargetObj} targetObject
     */
    functionCalled(args, targetObject) {
        ++this.callCount;
        if(this.recordCalls) {
            this.calls.push(args);
        }
        if(this.overrideFn) {
            return this.overrideFn(args, this, this.originalFn, targetObject);
        }
        else if(!this.noop) {
            return this.originalFn(...args);
        }
    }
}

/**
 * @template TTargetObj
 * @template {keyof TTargetObj} TObjectKey
 * @param {TTargetObj} target 
 * @param {TObjectKey} method 
 */
export default function mockInstanceMethod(target, method) {
    const origFn = target[method];
    if(typeof origFn == "function") {
        /** @type {TTargetObj} **/
        const fakeInstance = null;
        const mock = new FunctionMock(origFn, fakeInstance);
        target[method] = mock.wrapper;
        return mock;
    }
    else {
        throw new Error("Target "+method+" not a function");
    }
}