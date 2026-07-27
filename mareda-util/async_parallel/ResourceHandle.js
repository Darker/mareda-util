
/**
 * @template TConstructed
 * @typedef {(new (...args: any[]) => TConstructed)} CTorOf
 */

/**
 * @template TResource
 * 
 * @implements {mtypes.IResourceHandle<TResource>}
 */
class ResourceHandle {
    /**
     * @param {mtypes.ConstructibleResource<TResource>} resourceCtor
     * @param {...mtypes.ConstructorParametersFromCtor<mtypes.ConstructibleResource<TResource>>} ctorParams
     * 
     */
    constructor(resourceCtor, ctorParams) {
        this.ctor = resourceCtor;
        this.params = ctorParams;

        /** @type {TResource} **/
        this.resource = null;

        this.useCount = 0;

    }

    async init() {
        if(!this.resource) {
            this.resource = new this.ctor(...this.params);
        }
    }
    async beforeUse() {}
    async afterUse() {}
    async destroy() {}
    get() {
        if(!this.resource) {
            throw new Error("Attempted to create unitialized resource.")
        }
        return this.resource;
    }
    get uses() {
        return this.useCount;
    }
    /**
     * 
     * @param {number} add 
     */
    addUseCount(add) {
        this.useCount += add;
    }


    
};

export default ResourceHandle;