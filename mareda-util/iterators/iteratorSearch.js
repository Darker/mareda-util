
/**
 * @template T
 * @typedef {{item: T, score: number, index: number}} TopNItem
 */


/**
 * Finds the best N items in the given iterable, where smaller value means better.
 *
 * @template T
 * @param {Iterable<T>} iterable
 * @param {(item: T, index: number) => number} valueFn valueFn(badItem) > valueFn(goodItem)
 * @param {number} maxTopItems
 * @returns {TopNItem<T>[]}
 */
function topN(iterable, valueFn, maxTopItems) {
    if (maxTopItems <= 0) return [];

    // Max-heap implemented as a simple array of {score, item}
    /** @type {TopNItem<T>[]} **/
    const heap = [];

    const pushHeap = (/** @type {TopNItem<T>} */ entry) => {
        heap.push(entry);
        topNSiftUp(heap, heap.length - 1);
    };

    const replaceTop = (/** @type {TopNItem<T>} */entry) => {
        heap[0] = entry;
        topNSiftDown(heap, 0);
    };

    let index = 0;
    for (const item of iterable) {
        const score = valueFn(item, index);

        if (heap.length < maxTopItems) {
            pushHeap({ score, item, index });
        } else if (score < heap[0].score) {
            // Replace worst item
            replaceTop({ score, item, index });
        }

        ++index;
    }

    // Return sorted ascending (best first)
    return heap.sort((a, b) => a.score - b.score);
}

/**
 * @template T
 * @param {TopNItem<T>[]} heap 
 * @param {number} idx 
 */
function topNSiftUp(heap, idx) {
    while (idx > 0) {
        const parent = (idx - 1) >> 1;
        if (heap[parent].score >= heap[idx].score) break;
        [heap[parent], heap[idx]] = [heap[idx], heap[parent]];
        idx = parent;
    }
}

/**
 * @template T
 * @param {TopNItem<T>[]} heap 
 * @param {number} idx 
 */
function topNSiftDown(heap, idx) {
    const n = heap.length;
    while (true) {
        let largest = idx;
        const left = idx * 2 + 1;
        const right = idx * 2 + 2;

        if (left < n && heap[left].score > heap[largest].score) largest = left;
        if (right < n && heap[right].score > heap[largest].score) largest = right;

        if (largest === idx) break;
        [heap[idx], heap[largest]] = [heap[largest], heap[idx]];
        idx = largest;
    }
}


export const iteratorSearch = {
    topN
};