namespace mtypes {
    interface IResourceHandle<TResource> {
        // should be idempotent
        async init();
        async beforeUse();
        async afterUse();
        async destroy();

        get() : TResource;

        get uses() : number;
        addUseCount(add: number);
    }

    // type ConstructibleResource<TClassInst, TParams extends any[] = any[]> = {
    //     abstract new (...args: TParams): InstanceType<TClassInst>; 
    // } & TClassInst;

    // type CtorParams<TCtor extends abstract new (...args: any[]) => any> = ConstructorParameters<TCtor>;


    type ConstructibleResource<TResource> = new (...args: any[]) => TResource;

    type ConstructorParametersFromCtor<
    TCtor extends new (...args: any[]) => any
    > = ConstructorParameters<TCtor>;

}