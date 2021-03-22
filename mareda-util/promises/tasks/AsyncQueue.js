import ResolvablePromise from "../ResolvablePromise.js";
/**
 * This queue is designed for handling async tasks, such as events synchronously 
 * one by one. Every time an item is added to queue, next() resolves
 * @template ItemType
 * */
class AsyncQueue {
    constructor() {
        /** @type {ItemType[]} **/
        this.queue = [];
        this.itemPromise = new ResolvablePromise();
    }
    /**
     * 
     * @param {ItemType} item
     */
    push(item) {
        this.queue.push(item);
    }

    /**
     * Notifies promise that items are available
     * @private
     * */
    notifyItem() {
        const iprom = this.itemPromise;
        this.itemPromise = new ResolvablePromise();
        iprom.resolve(true);
    }

    /** 
     * @returns {Promise<ItemType>}
     */
    async next() {
        while (this.queue.length == 0) {
            await this.itemPromise;
        }
        return this.queue.shift();
    }

    /**
     * Kills all awaiters by a rejection
     * */
    stop() {
        const iprom = this.itemPromise;
        this.itemPromise = new ResolvablePromise();
        iprom.reject(new Error("Queue closed."));
    }
}

export default AsyncQueue;