import getFieldInherited from "../typing/getFieldInherited.js";
import { IS_TYPE_CHECKING } from "../typing/isTypeChecking.js";

class RPCSerializer {
    constructor() {
        // pending requests sent to other side that will resolve for one of the clients on this side
        this.pendingMesages = [];
        // pending incoming messages that are being evaluated on this side
        this.pendingRequests = [];
    }
    /**
     * @template {abstract new (...args: any) => any} TClassType
     * @param {TClassType} serverClass 
     */
    async createClient(serverClass) {
        /** @type {rpc.RPCClassClient<typeof serverClass>} **/
        // @ts-ignore
        const clientApi = {};
        
        /** @type {{[name:string]:rpc.DescriptorField}} **/
        // @ts-ignore
        const descriptor = serverClass.RPC_DESCRIPTOR;
        
        for(const [method, description] of Object.entries(descriptor)) {
            const originalMethod = getFieldInherited(serverClass, method);
            if(typeof originalMethod != "function") {
                throw new Error("Cannot set "+method+" to api, it is not a function!");
            }
            if(description.type == "async_generator") {
                clientApi[method] = async () => { throw new Error("Async generators not implemented yet"); }; 
            }
            else if(description.type == "generator") {
                clientApi[method] = async () => { throw new Error("Generators not implemented yet"); }; 
            }
            else if(description.type  == "promise") {
                clientApi[method] = async () => { throw new Error("Promises are not implemented yet!"); }; 
            }
        }

        return clientApi;
    }
};

if(IS_TYPE_CHECKING) {
    const testSerializer = new RPCSerializer();
    class TestApi {
        static RPC_DESCRIPTOR = {
            getNumber: {type: "sync"}
        }
        getNumber() {
            return 5;
        }
    }
    const testClient = await testSerializer.createClient(TestApi);   
}

export default RPCSerializer;