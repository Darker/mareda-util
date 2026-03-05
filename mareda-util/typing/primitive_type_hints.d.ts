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


    /**
     * Preserve a string‑literal tuple type.
     * Prevents TS from widening ["a", "b"] to string[].
     */
    function stringLiteralTuple<const T extends readonly string[]>(t: T): T {
        return t;
    }
}