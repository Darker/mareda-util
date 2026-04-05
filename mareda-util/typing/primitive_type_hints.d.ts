namespace mtypes {
    const testVal: any;
    const typeofTestval = typeof testVal;
    type typeofTypes = typeof typeofTestval;

    type JSTypeName<T> =
        T extends string ? "string" :
        T extends number ? "number" :
        T extends boolean ? "boolean" :
        T extends bigint ? "bigint" :
        T extends Function ? "function" :
        T extends Object ? "object" :
        T extends object ? "object" :
        T extends Symbol ? "symbol" :
        never;

    type ErrorType<Message extends string> = {
        __error__: Message;
    } & { __brand: "ErrorType" };

    type NullIfNullish<T> = T extends null | undefined ? null : NonNullable<T>;
    type NullIfNullishElse<T, TResult> = T extends null | undefined ? null : NonNullable<TResult>;

    type StringMatch<T1 extends string, T2 extends string> = T1 extends T2 ? true : false;
    type TypeChoice<T extends boolean, TIfTrue, TIfFalse> = T extends true ? TIfTrue : TIfFalse;

    type IsType<T, TExpected> = T extends TExpected ? true : false;

    type RecordTuple<TVals> = readonly [string, TVals];
    type RecordTupleValueType<TTuple> = TTuple extends [string, infer TValue] ? TValue : never;



    /**
     * Preserve a string‑literal tuple type.
     * Prevents TS from widening ["a", "b"] to string[].
     */
    function stringLiteralTuple<const T extends readonly string[]>(t: T): T {
        return t;
    }

    function tuple2<T1, T2>(t1: T1, t2: T2): readonly [T1, T2] {
        return [t1, t2];
    }
    function tuple3<T1, T2, T3>(t1: T1, t2: T2, t3: T3): readonly [T1, T2, T3] {
        return [t1, t2, t3];
    }
}