const GENERATOR_END = {};
const GENERATOR_CONTINUE = {};
const GENERATOR_NO_ITEM = {};

/**
 * @template TItem
 */
class GeneratorStep {
    constructor() {
        this.assignable = false;
        this.indexable = false;
        this.restartable = false;
        this.mustBeCloned = true;
    }
    /**
     * 
     * @returns {TItem}
     */
    getNext() {
        throw new Error("Not implemented");
    }
    getNextNonContinuing() {
        let val = this.getNext();
        while(val === GENERATOR_CONTINUE) {
            val = this.getNext();
        }
        return val;
    }
    /**
     * 
     * @param {number} index 
     * @returns {TItem}
     */
    getIndex(index) {
        if(this.indexable) {
            throw new Error("Not implemented");
        }
        else {
            throw new Error("Cannot getIndex on non-indexable generator");
        }
    }

    /**
     * @returns {number}
     */
    getLength() {
        if(this.indexable) {
            throw new Error("Not implemented");
        }
        else {
            throw new Error("Cannot getIndex on non-indexable generator");
        }
    }

    /**
     * 
     * @returns {typeof this}
     */
    getRestartedClone() {
        throw new Error("Not implemented");
    }

    /**
     * 
     * @returns {typeof this}
     */
    getRestarted() {
        if(!this.restartable) {
            throw new Error("This generator is not restartable!");
        }
        if(this.mustBeCloned) {
            return this.getRestartedClone();
        }
        else {
            return this;
        }
    }
}

class GeneratorEmptyStep extends GeneratorStep {
    constructor() {
        super();
        this.mustBeCloned = false;
    }

    getNext() {
        return GENERATOR_END;
    }
    getIndex(index) {
        return GENERATOR_NO_ITEM;
    }
}


/**
 * @template TItem
 * @extends GeneratorStep<TItem>
 */
class GeneratorGenSource extends GeneratorStep {
    /**
     * 
     * @param {Iterator<TItem>} source 
     */
    constructor(source) {
        super();
        
        /** @type {Iterator<TItem>} **/
        this.source = source;

        this.mustBeCloned = true;
    }

    getNext() {
        const next = this.source.next();
        if(next.done) {
            return GENERATOR_END;
        }
        else {
            return next.value;
        }
    }
}

/**
 * @template TItem
 * @extends GeneratorStep<TItem>
 */
class GeneratorIterableSource extends GeneratorStep {
    /**
     * 
     * @param {Iterable<TItem>|TItem[]} source 
     */
    constructor(source) {
        super();
        
        /** @type {Iterable<TItem>} **/
        this.source = source;
        this.restartable = true;

        if(source instanceof Array) {
            this.assignable = true;
            this.indexable = true;
            /** @type {TItem[]} **/
            this.array = source;
        }
        this.mustBeCloned = true;
        /** @type {Iterator<TItem, any, any>} **/
        this.iterator = null;
    }

    // @ts-ignore
    getRestartedClone() {
        return new GeneratorIterableSource(this.source);
    }

    getNext() {
        if(!this.iterator) {
            this.iterator = this.source[Symbol.iterator]();
        }
        const next = this.iterator.next();
        if(next.done) {
            return GENERATOR_END;
        }
        else {
            return next.value;
        }
    }

    /**
     * 
     * @param {number} index 
     * @returns {TItem}
     */
    getIndex(index) {
        if(this.array) {
            if(index >= 0 && index < this.array.length) {
                return this.array[index];
            }
            else {
                // @ts-ignore
                return GENERATOR_NO_ITEM;
            }
        }
        else {
            throw new Error("Cannot look up indices in a generator.");
        }
    }
}

/**
 * @template TItem
 * @template TResult
 * @extends {GeneratorStep<TResult>}
 */
class GeneratorNextStep extends GeneratorStep {
    /**
     * 
     * @param {GeneratorStep<TItem>} source 
     */
    constructor(source) {
        super();
        this.source = source;

        this.assignable = source.assignable;
        this.indexable = source.assignable;
        this.restartable = source.restartable;
        this.mustBeCloned = source.mustBeCloned;
    }

    /**
     * 
     * @returns {TResult}
     */
    getNext() {
        while(true) {
            const input = this.source.getNext();
            if(input == GENERATOR_CONTINUE) {
                continue;
            }
            else if(input == GENERATOR_END) {
                break
            }
            else {
                const processedInput = this.processInput(input);
                if(processedInput == GENERATOR_CONTINUE) {
                    continue;
                }
                else if(processedInput == GENERATOR_END) {
                    break;
                }
                else {
                    return processedInput;
                }
            }
        }
        //@ts-ignore
        return GENERATOR_END;
    }
    /**
     * This exists to avoid the overhead of handling end and continue
     * @param {TItem} input 
     * @returns {TResult}
     */
    processInput(input) {
        throw new Error("Process input not implemented!");
    }
}

/**
 * @template TItem
 * @template TResult
 * @extends {GeneratorNextStep<TItem, TResult>}
 */
class GeneratorMapStep extends GeneratorNextStep {
    /**
     * 
     * @param {GeneratorStep<TItem>} source 
     * @param {(input:TItem)=>TResult} transform
     */
    constructor(source, transform) {
        super(source);
        this.transform = transform;
    }

    // @ts-ignore
    getRestartedClone() {
        return new GeneratorMapStep(this.source.getRestarted(), this.transform);
    }
    /**
     * @inheritdoc
     */
    processInput(input) {
        return this.transform(input);
    }
    /**
     * @param {number} index 
     * @returns {TResult}
     */
    getIndex(index) {
        const val = this.source.getIndex(index);
        if(val === GENERATOR_NO_ITEM) {
            // @ts-ignore
            return GENERATOR_NO_ITEM;
        }
        else {
            return this.transform(val);
        }
    }
}

/**
 * @template TItem
 * @template TResult
 * @extends {GeneratorStep<TResult>}
 */
class GeneratorFlatStep extends GeneratorStep {
    /**
     * @constructor
     * @param {GeneratorStep<Iterable<TItem>>} source 
     * @param {(input:Iterable<TItem>)=>Iterator<TResult>} transform
     */
    constructor(source, transform) {
        super();
        this.transform = transform;
        this.indexable = false;
        this.source = source;
        this.restartable = this.source.restartable;

        /** @type {Iterator<TResult>} **/
        this.currentGenerator = null;
    }

    // @ts-ignore
    getRestartedClone() {
        return new GeneratorFlatStep(this.source.getRestarted(), this.transform);
    }

    /**
     * 
     * @returns {TResult}
     */
    getNext() {
        if(this.currentGenerator) {
            const next = this.currentGenerator.next();
            if(next.done) {
                this.currentGenerator = null;
            }
            else {
                return next.value;
            }
        }
        while(true) {
            const value = this.source.getNext();
            if(value == GENERATOR_END) {
                
                // @ts-ignore
                return GENERATOR_END;
            }
            if(value == GENERATOR_CONTINUE) {
                continue;
            }
            // @ts-ignore
            this.currentGenerator = this.transform ? this.transform(value) : value[Symbol.iterator]();
            // @ts-ignore
            // Returning continue to avoid stack overflow if there are too many empty entries
            return GENERATOR_CONTINUE;
        }
    }
}

/**
 * @template TItem
 * @extends {GeneratorNextStep<TItem, TItem>}
 */
class GeneratorFilterStep extends GeneratorNextStep {
    /**
     * 
     * @param {GeneratorStep<TItem>} source 
     * @param {(input:TItem)=>boolean} predicate
     */
    constructor(source, predicate) {
        super(source);
        this.predicate = predicate;

        this.assignable = false;
        this.indexable = false;
        this.restartable = source.restartable;
        this.mustBeCloned = source.mustBeCloned;
    }
    // @ts-ignore
    getRestartedClone() {
        return new GeneratorFilterStep(this.source.getRestarted(), this.predicate);
    }
    processInput(input) {
        if(this.predicate(input)) {
            return input;
        }
        else {
            return GENERATOR_CONTINUE;
        }
    }
}

/**
 * @template TFirstItem
 * @template TSecondItem
 * @extends {GeneratorStep<{first:TFirstItem, second:TSecondItem}>}
 */
class GeneratorZipStep extends GeneratorStep {
    /**
     * 
     * @param {GeneratorStep<TFirstItem>} firstSource 
     * @param {GeneratorStep<TSecondItem>} secondSource 
     * @param {boolean} bothMustExist
     * @param {boolean} tieToFirst if true, iteration ends once first is exhausted
     */
    constructor(firstSource, secondSource, bothMustExist = false, tieToFirst = false) {
        super();
        this.firstSource = firstSource;
        this.secondSource = secondSource;
        this.bothMustExist = bothMustExist;
        this.tieToFirst = tieToFirst;
        this.restartable = firstSource.restartable && secondSource.restartable;
        this.mustBeCloned = false;

        this.indexable = false;

        this.firstEnded = false;
        this.secondEnded = false;
    }
    // @ts-ignore
    getRestartedClone() {
        return new GeneratorZipStep(
            this.firstSource.getRestarted(),
            this.secondSource.getRestarted(),
            this.bothMustExist,
            this.tieToFirst
        );
    }
    /**
     * 
     * @returns {{first:TFirstItem, second:TSecondItem}}
     */
    getNext() {
        const first = this.firstSource.getNextNonContinuing();
        const second = this.secondSource.getNextNonContinuing();
        if(first === GENERATOR_END && second === GENERATOR_END) {
            // @ts-ignore
            return GENERATOR_END;
        }
        if(first === GENERATOR_END && this.tieToFirst) {
            // @ts-ignore
            return GENERATOR_END;
        }
        if(this.bothMustExist && (first === GENERATOR_END || second === GENERATOR_END)) {
            throw new RangeError("GeneratorZipStep did not obtain a value from both sources but was required to.");
        }

        const result = {first: null, second: null};
        if(first !== GENERATOR_END) {
            result.first = first;
        }
        if(second !== GENERATOR_END) {
            result.second = second;
        }
        return result;
    }
}

/**
 * @template TItem
 * @template TResult
 * @extends GeneratorStep<TResult>
 */
class GeneratorTransformStep extends GeneratorStep {
    /**
     * The second argument to the callback becomes useful if you want to merge results until a certain point
     * To make use of it, you need to return GENERATOR_CONTINUE when you don't want your last results to be returned yet
     * 
     * You can alter the result set, but note that once you return something else than continue, the results will be commited
     * @param {GeneratorStep<TItem>} source 
     * @param {(input:TItem, queuedResults:TResult[]?)=>TResult[]} transform if it returns more than one item, these become individual steps
     */
    constructor(source, transform) {
        super();
        this.source = source;
        this.transform = transform;
        /** @type {TResult[]} **/
        this.nextItems = [];

        this.assignable = source.assignable;
        this.indexable = false;
        this.restartable = source.restartable;
        this.mustBeCloned = source.mustBeCloned;
    }

    // @ts-ignore
    getRestartedClone() {
        return new GeneratorTransformStep(this.source.getRestarted(), this.transform);
    }
    /**
     * 
     * @returns {TResult}
     */
    getNext() {
        if(this.nextItems && this.nextItems.length > 0) {
            return this.nextItems.shift();
        }

        while(true) {
            if(this.nextItems && this.nextItems.length > 0) {
                return this.nextItems.shift();
            }
            const inputNext = this.source.getNext();
            if(inputNext == GENERATOR_END) {
                break;
            }
            const results = this.transform(this.source.getNext(), this.nextItems);
            if(results == GENERATOR_CONTINUE) {
                continue;
            }
            else if(results == GENERATOR_END) {
                break;
            }
            else {
                if(results.length == 1) {
                    return results[0];
                }
                else {
                    const resCurrent = results.shift();
                    this.nextItems = results;
                    return resCurrent;
                }
            }
        }
        // @ts-ignore
        return GENERATOR_END;
    }
}

/**
 * @template TItem extends any
 * @implements {Iterable<TItem>}
 */
class LazyGenerator {
    /**
     * 
     * @param {TItem[]|Generator<TItem>|GeneratorStep<TItem>|Iterable<TItem>} sourceData 
     */
    constructor(sourceData) {
        // steps before iteration is first triggered
        this.steps = [];

        this.steps.push(LazyGenerator.createSourceStep(sourceData));
        // if this is true and another attempt to trigger it is done, the steps will be cloned if possible
        this.started = false;
    }

   /**
     * @template TItem
     * @param {TItem[]|Generator<TItem>|GeneratorStep<TItem>|Iterable<TItem>} sourceData 
     */
   static create(sourceData) {
        return new LazyGenerator(sourceData);
   }

    /**
     * @template TItem
     * @param {TItem[]|Iterator<TItem>|GeneratorStep<TItem>|Iterable<TItem>} sourceData 
     * @param {boolean} cloneStep if true and first arg is GeneratorStep, it will be reset and cloned
     * @returns {GeneratorStep<TItem>}
     * 
     */
    static createSourceStep(sourceData, cloneStep = true) {
        const first = typeof sourceData != "undefined" && sourceData != null;

        if(first) {
            if(sourceData instanceof GeneratorStep) {
                return cloneStep ? sourceData.getRestarted() : sourceData;
            }
            // @ts-ignore
            else if(typeof sourceData.next === "function") {
                // @ts-ignore
                return new GeneratorGenSource(sourceData);
            }
            else if(typeof sourceData[Symbol.iterator] === "function") {
                // @ts-ignore
                return new GeneratorIterableSource(sourceData);
            }
            else {
                throw new TypeError("Unsupported source type for LazyGenerator")
            }
        }
        else {
            // @ts-ignore
            return new GeneratorEmptyStep();
        }
    }

    get lastStep() {
        return this.steps[this.steps.length - 1];
    }

    getIterationStep() {
        if(!this.started) {
            this.started = true;
            return this.lastStep;
        }
        else {
            if(!this.lastStep.restartable) {
                throw new Error("This LazyGenerator cannot be restarted - one of the sources is a non-restartable source.");
            }
            return this.lastStep.getRestarted();
        }
    }
    
    * items() {
        let lastStep = this.getIterationStep();
        while(true) {
            const val = lastStep.getNext();
            if(val == GENERATOR_CONTINUE) {
                continue;
            }
            else if(val == GENERATOR_END) {
                return;
            }
            else {
                yield val;
            }
        }
    }

    /**
     * 
     * @returns {Generator<TItem>}
     */
    [Symbol.iterator]() {
        return this.items();
    }

    /**
     * @template TMapResult
     * @param {(input:TItem)=>TMapResult} mapFunc 
     * @returns {LazyGenerator<TMapResult>}
     */
    map(mapFunc) {
        if(this.started) {
            throw new Error("Can't modify in-progress generator");
        }
        // @ts-ignore
        this.steps.push(new GeneratorMapStep(this.lastStep, mapFunc));
        // @ts-ignore
        return this;
    }
    /**
     * @param {(input:TItem)=>boolean} predicate 
     * @returns {typeof this}
     */
    filter(predicate) {
        if(this.started) {
            throw new Error("Can't modify in-progress generator");
        }
        this.steps.push(new GeneratorFilterStep(this.lastStep, predicate));
        return this;
    }

    /**
     * @template TSecondItem
     * @template {true|false} [VBothExist=false]
     * @param {TSecondItem[]|Iterator<TSecondItem>|GeneratorStep<TSecondItem>|Iterable<TSecondItem>} iterableData 
     * @param {VBothExist} bothMustExist if true an exception is thrown if one ends before the other
     * @param {boolean} tieToFirst if true, iteration ends when the sources if this generator are exhausted, ignoring anything left in second
     * @returns {LazyGenerator<{first:TItem, second:TypeChoice<VBothExist, TSecondItem, TSecondItem|null>}>}
     */
    // @ts-ignore (https://github.com/microsoft/TypeScript/issues/59214)
    zip(iterableData, bothMustExist = false, tieToFirst = false) {
        const firstSource = this.lastStep;
        const secondSource = LazyGenerator.createSourceStep(iterableData, false);
        // @ts-ignore
        this.steps.push(new GeneratorZipStep(firstSource, secondSource, bothMustExist,tieToFirst));
        // @ts-ignore
        return this;
    }

    /**
     * @template TFlatItem
     * @param {(inputItems:TItem)=>Iterator<TFlatItem>} flatMapFn 
     * @returns {LazyGenerator<TFlatItem>}
     */
    flatMap(flatMapFn = (x)=>x[Symbol.iterator]()) {
        if(this.started) {
            throw new Error("Can't modify in-progress generator");
        }
        // @ts-ignore
        this.steps.push(new GeneratorFlatStep(this.lastStep, flatMapFn));
        // @ts-ignore
        return this;
    }

    /**
     * 
     * @returns {LazyGenerator<IterableEntryType<TItem>>}
     */
    flat() {
        if(this.started) {
            throw new Error("Can't modify in-progress generator");
        }

        // @ts-ignore
        this.steps.push(new GeneratorFlatStep(this.lastStep));
        // @ts-ignore
        return this;
    }
};

export {GeneratorStep};
export default LazyGenerator;