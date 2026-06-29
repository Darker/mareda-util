import timeoutPromise from "../timeoutPromise.js";
import ConditionVariable from "./ConditionVariable.js";

/**
 * This class lets you prevent too many async calls from executing
 * 
 * The shouldRun method resolves with false to indicate another call was
 * "let through" recently. If it resolves with true, that call is the one being let through
 * 
 * There is no order guarantee, the assumption is all calls are attempting to do the same thing.
 */
class Debouncer {
    /**
     * Min delay to wait for another trigger
     * max delay lets an event through even if triggers keep coming
     * @param {number} minDelay 
     * @param {number} maxDelay 
     */
    constructor(minDelay, maxDelay) {
        this.minDelay = minDelay;
        this.maxDelay = maxDelay;
        // last hit to shouldRun
        this.lastHit = 0;
        // time when sleeping started
        this.firstHit = 0;
        this.sleeping = false;
    }

    async shouldRun() {
        if(!this.sleeping) {
            this.lastHit = performance.now();
            this.firstHit = this.lastHit;
            this.sleeping = true;
            let delay = this.minDelay;
            while(true) {
                await timeoutPromise(delay);
                delay = Math.ceil(this.minDelay/2);
                const now = performance.now();
                if(now - this.lastHit > this.minDelay || now - this.firstHit > this.maxDelay) {
                    this.sleeping = false;
                    this.lastHit  = this.firstHit = 0;
                    return true;
                }
            }
        }
        else {
            this.lastHit = performance.now();
            return false;
        }
    }
};

export default Debouncer;