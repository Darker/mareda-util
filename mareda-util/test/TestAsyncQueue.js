import AsyncQueue from "../promises/tasks/AsyncQueue.js";



(async () => {
    const queue = new AsyncQueue();
    console.log(queue);
    const i1 = setInterval(() => {
        console.log(queue.closed, 1);
        if(!queue.closed)
            queue.push(Math.random());
    }, 500);
    const i2 = setInterval(() => {
        console.log(queue.closed, 2);
        if (!queue.closed)
            queue.push(Math.random());
    }, 820);
    const i3 = setInterval(() => {
        console.log(queue.closed, 3);
        if (!queue.closed)
            queue.push(Math.random());
    }, 666);
    setTimeout(() => queue.close(), 5000);
    try {
        while (queue.hasNext()) {
            console.log("Awaiting item.");
            const item = await queue.next();
            console.log("Item loaded: ", item, "Remaining:", queue.queue);
        }
    }
    catch (e) {
        console.trace(e);
    }

    console.log(queue.queue);
    clearInterval(i1);
    clearInterval(i2);
    clearInterval(i3);
})();