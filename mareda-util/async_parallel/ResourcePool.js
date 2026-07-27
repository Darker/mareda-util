import { itertools } from "../iterators/itertools.js";
import ConditionVariable from "../promises/concurrency/ConditionVariable.js";
import DeferredPromise from "../promises/DeferredPromise.js";
import ResolvablePromise from "../promises/ResolvablePromise.js";



/**
 * @template {object} TResource
 */
class ResourcePool {
    /**
     * @param {() => mtypes.IResourceHandle<TResource>} handleFactory
     * @param {object} [param1]
     * @param {number} [param1.maxParallel]
     * @param {number} [param1.maxResources]
     */
    constructor(handleFactory, {maxParallel = 1, maxResources = 4} = {}) {
        this.factory = handleFactory;

        if(maxParallel < 1) {
            throw new Error("maxParallel = "+maxParallel+" but must be >=1")
        }

        this.maxResources = maxResources;
        this.maxParallel = maxParallel;

        this.locked = false;
        this.cvUnlocked = new ConditionVariable();
        this.cvResourceFreed = new ConditionVariable();

        /** @type {mtypes.IResourceHandle<TResource>[]} **/
        this.resources = [];

        /** @type {Error} **/
        this.fatal = null;

        this.totalUse = 0;
    }

    /**
     * @template TRes
     * @param {(res: TResource, signal?: AbortSignal) => Promise<TRes>} cb 
     * @param {object} [opts]
     * @param {AbortSignal} [opts.abortSignal]
     */
    async use(cb, {abortSignal = null} = {}) {
        if(this.fatal) {
            throw new Error("ResourcePool in broken state", {cause: this.fatal});
        }
        if(this.locked) {
            await this.awaitUnlock({abortSignal});
        }
        
        while(true) {
            let resIdx = -1;

            {
                let min = this.maxParallel;
                const len = this.resources.length;
                for(let i = 0; i<len; ++i) {
                    const res = this.resources[i];
                    if(res.uses < min) {
                        min = res.uses;
                        resIdx = i;
                        if(this.maxParallel == 1) {
                            break;
                        }
                    }
                }
            }
            let isNewResource = false;
            if(resIdx == -1 && this.resources.length < this.maxResources) {
                const nextResource = this.factory();
                this.resources.push(nextResource);
                resIdx = this.resources.length - 1;
                isNewResource = true;
            }
            if(resIdx !== -1) {
                const res = this.resources[resIdx];
                res.addUseCount(1);
                ++this.totalUse;
                try {
                    if(isNewResource) {
                        await res.init();
                    }
                    
                    await res.beforeUse();
                    const result = await cb(res.get(), abortSignal);
                    return result;
                }
                finally {
                    try {
                        await res.afterUse();
                    }
                    catch(e) {
                        this.fatal = new Error("Fatal: afterUse threw error", {cause: e});
                    }
                    res.addUseCount(-1);
                    this.cvResourceFreed.wakeAll();
                    --this.totalUse;
                }
            }
            else {
                await this.cvResourceFreed.wait({abortSignal});

                if(this.locked) {
                    await this.awaitUnlock();
                }
            }
        }
    }

    /**
     * @template TRes
     * @param {(res: TResource, signal?: AbortSignal) => AsyncGenerator<TRes>} cbGen 
     * @param {object} [opts]
     * @param {AbortSignal} [opts.abortSignal]
     */
    async * useGen(cbGen, {abortSignal = null} = {}) {
        const done = new ResolvablePromise();
        /** @type {ResolvablePromise<TResource>} **/
        const resourcePromise = new ResolvablePromise();

        let afterUse = new DeferredPromise(
            this.use(async resource => {
                resourcePromise.resolve(resource);
                await done.get();
            })
        );
        const res = await resourcePromise.get();
        try {
            yield* cbGen(res);
        }
        finally {
            done.resolve();
            await afterUse.get();
        }
    }

    /**
     * Use this to wait for all resources to be unused,
     * then perform an operation on each of them
     * 
     * @param {(res: TResource)=>Promise<void>} cb 
     */
    async allSync(cb) {
        try {
            this.locked = true;
            while(this.totalUse > 0) {
                if(this.fatal) {
                    throw new Error("ResourcePool in broken state", {cause: this.fatal});
                }
                await this.cvResourceFreed.wait();
            }
            const errs = [];

            for(const res of this.resources) {
                try {
                    await res.beforeUse();
                    await cb(res.get());
                }
                catch(e) {
                    errs.push(e instanceof Error ? e : new Error("Unknown error", {cause: e}));
                }
                finally {
                    try {
                        await res.afterUse();
                    }
                    catch(e) {
                        errs.push(e instanceof Error ? e : new Error("Unknown error", {cause: e}));
                    }
                }
            }
            if(errs.length > 1) {
                throw new AggregateError(errs, "Multiple errors in allSync");
            }
            else if(errs.length == 1) {
                throw errs[0];
            } 
            return;
        }
        finally {
            this.locked = false;
            this.cvUnlocked.wakeAll();
        }
    }

    /**
     * @param {object} [opts]
     * @param {AbortSignal} [opts.abortSignal]
     */
    async awaitUnlock({abortSignal = null} = {}) {
        while(this.locked) {
            await this.cvUnlocked.wait({abortSignal});
        }
    }
};

export default ResourcePool;