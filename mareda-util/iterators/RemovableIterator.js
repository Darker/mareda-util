/**
 * @template T
 * */
class RemovableEntry {
    /**
     * 
     * @param {T[]} array
     * @param {number} index
     */
    constructor(array, index) {
        this.entry = null;
        this.array = null;
        this.index = -1;
        this.removed = false;
        this.reset(array, index);
    }
    remove() {
        if (!this.removed) {
            this.removed = true;
            this.array.splice(this.index, 1);
        }
    }
    get value() {
        return this.entry;
    }
    set value(value) {
        this.replace(value);
    }
    /**
     * Replace original item with new one. Cannot be used if item was deleted
     * @param {T} newItem
     */
    replace(newItem) {
        if (this.removed) {
            throw new Error("RemovableEntry: cannot replace item that was deleted.");
        }
        this.entry = newItem;
        this.array[this.index] = newItem;
    }
    /**
     * 
     * @param {T[]} array
     * @param {number} index
     */
    reset(array, index) {
        if(array)
            this.entry = array[index];
        this.array = array;
        this.index = index;
        this.removed = false;
    }
}

/**
 * @template T
 * @param {T[]} array
 * @returns {IterableIterator<RemovableEntry<T>>}
 */
function* RemovableIterator(array) {
    let entry = null;
    for (let i = 0, l = array.length; i < l; ++i) {
        const item = array[i];
        if (!entry) {
            entry = new RemovableEntry(array, i);
        }
        else {
            entry.reset(array, i);
        }

        yield entry;
        if (entry.removed) {
            --i;
            --l;
        }
    }
}

//const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
//console.log(items);
//for (const iter of removableIterator(items)) {
//    if (iter.entry % 2 !== 0) {
//        iter.remove();
//    }
//    else {
//        iter.replace(iter.entry * 10);
//    }
//}
//console.log(items);
module.exports = RemovableIterator;
