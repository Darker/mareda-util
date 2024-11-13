const TASK_SYNC = {};
const TASK_ASYNC = {};
const TASK_END = {};

/**
 * @typedef {Object} WrappedPromise
 * @prop {number} index - the index in pending tasks, so we know what to replace
 * @prop {}
 */

class AsyncPool {
    constructor() {
        this.size = 5;
        this.tasks = [];
    }

    async getNextTask() {
        return null;
    }
    hasNextTask() {
        return false;
    }

    /**
     * 
     * @param {number} targetIndex 
     * @param {Promise} task 
     */
    async wrapTask(targetIndex, task) {
        let result = {
            data: null,
            error: null,
            index: targetIndex
        };
        try {
            result.data = await task;
        }
        catch(e) {
            result.error = e;
        }
        return result;
    }

    async awaitNext() {

    }
};

export default AsyncPool;