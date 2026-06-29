import SimpleMutex from "./SimpleMutex.js";


/**
 * @template TValue
 */
class IdempotentValue {
    /**
     * 
     * @param {() => Promise<TValue>} valueSource 
     * @param {number} lifetimeMs value is re-generated after this timeout
     *                          defaults to 0 meaning infinity, with a timeout
     *                          this is no longer a true idempotent value
     * @param {Performance} perf should have a now() function that returns monotonic ms time
     */
    constructor(valueSource, lifetimeMs = 0, perf = performance) {
        this.src = valueSource;
        this.lifetimeMs = lifetimeMs;
        this.generatedAt = 0;
        /** @type {TValue} **/
        this.value = null;
        this.valueError = null;

        this.lock = new SimpleMutex();
        this.perf = perf;
    }

    async get() {
        if(this.hasValue()) {
            if(this.valueError != null) {
                throw this.valueError;
            }
            return this.value;
        }
        else {
            return await this.lock.locked(async () => {
                if(this.hasValue()) {
                    if(this.valueError != null) {
                        throw this.valueError;
                    }
                    return this.value;
                }
                this.valueError = null;
                try {
                    this.value = await this.src();
                    return this.value;
                }
                catch(e) {
                    if(e == null) {
                        e = new Error("error thrown was null");
                    }
                    this.valueError = e;
                    throw e;
                }
                finally {
                    this.generatedAt = this.perf.now();
                }
            });
        }
    }

    /**
     * 
     * @param {Pick<Console, "error">} [logger] 
     */
    async preload(logger = null) {
        try {
            await this.get();
        }
        catch(e) {
            // will be thrown on true get();
            if(logger) {
                logger.error(e);
            }
        }
    }

    hasValue() {
        return this.generatedAt > 0 && (this.lifetimeMs == 0 || this.perf.now() - this.generatedAt < this.lifetimeMs);
    }
};

export default IdempotentValue;