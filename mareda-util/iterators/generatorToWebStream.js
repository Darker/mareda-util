/**
 * 
 * @param {IterableBytes} gen 
 */
export default function generatorToWebStream(gen) {
    const iterator = gen[Symbol.asyncIterator]();
    return new ReadableStream({
        async cancel() {
            await iterator.return();
        },
        async pull(controller) {
            const { value, done } = await iterator.next();
            if (done) {
                controller.close();
            }
            else {
                controller.enqueue(value);
            }
        }
    });
}
