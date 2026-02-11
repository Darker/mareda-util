namespace mtypes {



    type ClassMethods<TClass> = {
        [K in keyof TClass]: TClass[k] extends (...args: any[]) => any ? "func" : "prop"; // extends Promise<any> ? "true" : "false"
    }

    type FunctionKeys<TClass> = {
        [K in keyof TClass]: TClass[K] extends (...args: any[]) => any ? K : never;
    };

    type FunctionPropertyNames<TClass> = {
        [K in keyof TClass]: TClass[K] extends (...args: any[]) => any ? K : never;
    }[keyof TClass];

    type AsyncMethodNames<TClass> = {
        [K in keyof TClass]: TClass[K] extends ((...args: any[]) => Promise<any>) ? K : never;
    }[keyof TClass];

    type AsyncGeneratorMethodNames<TClass> = {
        [K in keyof TClass]: TClass[K] extends (((...args: any[]) => AsyncGenerator<any, any, any>)) ? K : never;
    }[keyof TClass];

    type GeneratorMethodNames<TClass> = {
        [K in keyof TClass]: TClass[K] extends (((...args: any[]) => Generator<any, any, any>)) ? K : never;
    }[keyof TClass];

    type SpecialMethodNames<TClass> = GeneratorMethodNames<TClass> | AsyncGeneratorMethodNames<TClass> | AsyncMethodNames<TClass>;

    type NormalMethodNames<TClass> = keyof Pick<TClass, Exclude<FunctionPropertyNames<TClass>, SpecialMethodNames<TClass>>>;

    type MakeFuncAsync<TFunction extends (...args: any[]) => any> = TFunction extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : never;
    type MakeGeneratorFuncAsync<TFunction extends (...args: any[]) => Generator<any, any, any>>
        = TFunction extends (...args: infer A) => Generator<infer B, any, any> ? (...args: A) => AsyncGenerator<B, any, any> : never;

    type ApiDescription<TClass> = {
        [K in keyof TClass["constructor"]["RPC_DESCRIPTOR"]]: TClass["constructor"]["RPC_DESCRIPTOR"][K];
    }

    type AllClassFieldsRenamed<TClass> = {
        [K in keyof TClass]: TClass[K] extends Function ? `func:${K}` : `field:${K}`;
    }[keyof TClass];

    type AllClassFields<TClass> = {
        [K in keyof TClass]: TClass[K] extends Function ? never : K;
    }[keyof TClass];

    type PromisifiedClass<TClass> = {
        [K in NormalMethodNames<TClass>]: MakeFuncAsync<TClass[K]>;
    } & {
        [K in AsyncMethodNames<TClass>]: TClass[K];
    } & {
        [K in AsyncGeneratorMethodNames<TClass>]: TClass[K];
    } & {
        [K in GeneratorMethodNames<TClass>]: MakeGeneratorFuncAsync<TClass[K]>;
    }

    type getClassFieldType<TClass, TKey extends keyof TClass> = TClass[TKey];
    type getClassFieldFields<TClass, TKey extends keyof TClass> = keyof TClass[TKey];

    function testFunc(input: number) {
        return input.toString();
    }
    function* testGeneratorFunc(input: number) {
        yield input.toString();
    }

    const testFuncAsync: MakeFuncAsync<typeof testFunc>;
    const testGeneratorFuncAsync: MakeGeneratorFuncAsync<typeof testGeneratorFunc>;


    

    
}