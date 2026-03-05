

type IteratorEntryType<T extends Iterator> = T extends Iterator<infer TValue> ? TValue : never;
type IterableEntryType<T extends Iterable> = T extends Iterable<infer TValue> ? TValue : never;


type TypeChoice<T extends boolean, TIfTrue, TIfFalse> = T extends true ? TIfTrue : TIfFalse;

type DecayExtends<T, X extends T> = T;

interface IterableBytes {
    [Symbol.asyncIterator]: ()=>AsyncIterableIterator<Uint8Array<ArrayBufferLike>>|ReadableStreamAsyncIterator<Uint8Array<ArrayBufferLike>>
}