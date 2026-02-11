namespace rpc {

    type methodTypes = "promise" | "sync" | "generator" | "async_generator";
    interface DescriptorField  {
        type: methodTypes;
    }
    type ClassMethodsDescriptor<TClassType> = {
        [K in mtypes.FunctionPropertyNames<TClassType>]: DescriptorField
    } & {[key: string]: DescriptorField?}

    type ClassTypeWithDescriptor<TClassType> = {
        abstract new (...args: any): InstanceType<TClassType>; 
        RPC_DESCRIPTOR: ClassMethodsDescriptor<TClassType>
    };

    type ClassConstructorWitDescriptor<TClassType> = Function & {RPC_DESCRIPTOR: ClassMethodsDescriptor<TClassType>}

    type ClassInstanceWithDescriptor<TInst> = {
        constructor: ClassTypeWithDescriptor<TInst>
    } & TInst;

    type RPCClassClient<TClassType> = Pick<mtypes.PromisifiedClass<InstanceType<TClassType>>, mtypes.getClassFieldFields<TClassType, "RPC_DESCRIPTOR">>;

    type MessageType = "request" | "response" | "response_error" | "protocol";

    interface MessageAbstract {
        id: number;
    }

    interface MessageRequest extends MessageAbstract {
        type: "request";
        methodName: string;
        args: any[];
    }

    interface MessageResponse extends MessageAbstract {
        // ID of message we are responding TO
        responseTo: number;
    }

    interface MessageResponseOk extends MessageResponse {
        type: "response";
        data: any;
    }

    interface MessageResponseErr extends MessageResponse {
        type: "response_error";
        error: string;
        stack: string[];
        errorProps: Record<string, any>;
    }

    interface MessageProtocol extends MessageAbstract {
        type: "protocol";
        data: any;
        action: string;
    }

    type Message = MessageRequest | MessageResponseOk | MessageResponseErr | MessageProtocol;

    class TestClass {
        public static RPC_DESCRIPTOR: ClassMethodsDescriptor<TestClass> = {
            testMethod: { type: "sync" },
            testMethodAsync: { type: "promise" },
            testMethodAsyncTwo: { type: "promise" },
            testMethodAsyncGenerator: { type: "async_generator" },
            testMethodArray: { type: "sync" },
            testMethodGenerator: { type: "generator" },
            testNotExist: {type: "generator"}
        };
        constructor(public test: string) {
            this.test = test;
        }
        public testMethod() {
            return this.test;
        }
        public async testMethodAsync() {
            return this.test;
        }
        public async testMethodAsyncTwo() {
            return this.test;
        }
        public async *testMethodAsyncGenerator() {
            yield this.test;
        }
        public testMethodArray() {
            return [this.test];
        }
        public * testMethodGenerator() {
            yield this.test;
        }

        public testNotMentioned() {

        }
    }

    function requiresDesc<T extends ClassInstanceWithDescriptor<any>>(arg: T): InstanceType<T> {
        
    }

    class Nondescript {

    }

    const testRes = requiresDesc(typeof Nondescript);
    const testDes: ClassTypeWithDescriptor<string> = Nondescript;


    type TestClassRPCClient = RPCClassClient<typeof TestClass>;

    type getClassRPCDescFields<TClass> = mtypes.getClassFieldFields<typeof TClass, "RPC_DESCRIPTOR">;
    type descriptorFieldsDirect = mtypes.getClassFieldFields<typeof TestClass, "RPC_DESCRIPTOR">;
    type descriptorFields = getClassRPCDescFields<TestClass>;

    type TestClassFields = mtypes.AllClassFields<TestClass>;

    type TestClassApi = mtypes.ApiDescription<TestClass>;

    type TestClassMethods = mtypes.FunctionPropertyNames<TestClass>;
    type TestClassAsyncMethods = mtypes.AsyncMethodNames<TestClass>;
    type TestClassAsyncGeneratorMethods = mtypes.AsyncGeneratorMethodNames<TestClass>;
    type TestClassGeneratorMethods = mtypes.GeneratorMethodNames<TestClass>;
    type TestClassSpecialMethods = mtypes.SpecialMethodNames<TestClass>;

    type TestClassNormalMethods = mtypes.NormalMethodNames<TestClass>;

    type TestClassPromisified = mtypes.PromisifiedClass<TestClass>;


    const testClassPromisifiedInst: TestClassPromisified;
    const testTranslatedReturnVal = testClassPromisifiedInst.testMethod();

    const testClassFieldType: mtypes.getClassFieldType<TestClass, "test">;

    const testGetClassFieldFields: mtypes.getClassFieldFields<TestClass, "test">;
}
