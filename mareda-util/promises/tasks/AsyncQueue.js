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
        this.closed = false;
    }
    /**
     * 
     * @param {ItemType} item
     */
    push(item) {
        if (this.closed) {
            throw new Error("Queue is closed, more items cannot be added.");
        }
        console.log("Added item", item);
        this.queue.push(item);
        this.notifyItem();
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

    hasNext() {
        return (!this.closed || this.queue.length > 0);
    }

    /** 
     * @returns {Promise<ItemType>}
     */
    async next() {
        while (this.queue.length == 0) {
            if (this.closed) {
                throw new Error("No more items, queue is closed.");
            }
            await this.itemPromise.promise;
        }
        return this.queue.shift();
    }

    /**
     * Kills all awaiters by a rejection
     * */
    stop() {
        const iprom = this.itemPromise;
        this.itemPromise = new ResolvablePromise();
        iprom.reject(new Error("No more items, queue is closed."));
    }

    /**
     * Use this to guarantee that no more items will be added. 
     * Attempting to add items to closed queue throws an error.
     * */
    close() {
        this.closed = true;
        if (this.queue.length == 0)
            this.stop();
    }
}

export default AsyncQueue;