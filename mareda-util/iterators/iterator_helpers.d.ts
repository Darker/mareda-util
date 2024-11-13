

type IteratorEntryType<T extends Iterator> = T extends Iterator<infer TValue> ? TValue : never;
type IterableEntryType<T extends Iterable> = T extends Iterable<infer TValue> ? TValue : never;


type TypeChoice<T extends boolean, TFirst, TSecond> = T extends true ? TFirst : TSecond;

type DecayExtends<T, X extends T> = T;