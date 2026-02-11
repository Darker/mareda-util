import ResolvablePromise from "../promises/ResolvablePromise.js";

const PENDING_RPC_GENERATOR_END = Object.freeze({});

class PendingRPC {
    static GENERATOR_END = PENDING_RPC_GENERATOR_END;
    /**
     * 
     * @param {Object} [param0]
     * @param {AbortSignal} [param0.abortSignal]
     */
    constructor({abortSignal = null}={}) {
        this.resolutionPromise = new ResolvablePromise(abortSignal);
    }

    async waitPromise() {
        return await this.resolutionPromise.get();
    }

    async * waitGenerator() {
        while(true) {
            const entry = await this.resolutionPromise.get();
        }
    }
};

/** @type {rpc.AsyncMethods<PendingRPC>} **/
const test = null;
const funcr = test.waitGenerator;
const notf = test.resolutionPromise;
const a = {a: 1};
const b = {b: 1};

/** @type {rpc.Merge<typeof a, typeof b>} **/
const c = null;

export default PendingRPC;