

type IteratorEntryType<T extends Iterator> = T extends Iterator<infer TValue> ? TValue : never;
type IterableEntryType<T extends Iterable> = T extends Iterable<infer TValue> ? TValue : never;

type DictFromItem<TItem> = TItem extends readonly [string, infer TValue] ? Record<string, TValue> : never;
type DictFromItemMethod<TItem> =  TItem extends readonly [string, infer TValue] ?  ()=>Record<string, TValue> : never;

type ZipResultValue<TIsTuple extends Boolean, TFirstItem, TSecondItem> 
        = mtypes.TypeChoice<TIsTuple, [TFirstItem, TSecondItem], {first:TFirstItem, second:TSecondItem}>;

interface IterableBytes {
    [Symbol.asyncIterator]: ()=>AsyncIterableIterator<Uint8Array<ArrayBufferLike>>|ReadableStreamAsyncIterator<Uint8Array<ArrayBufferLike>>
}