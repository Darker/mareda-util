import ResolvablePromise from "../promises/ResolvablePromise.js";
import RPCNode from "./RPCNode.js";

class PendingRPCReceived {
    /**
     * @param {number} origId
     * @param {any} methodName
     * @param {any} responseId
     */
    constructor(origId, methodName, responseId) {
        this.origId = origId;
        this.methodName = methodName;
        this.responseId = responseId;

        this.result = new ResolvablePromise();
        this.resolved = false;
    }
}


/**
 * @template {InstanceType<any>} TInstRaw
 * @template {rpc.ClassInstanceWithDescriptor<TInstRaw>} TInstDesc
 */
class RPCClient extends RPCNode {
    /**
     * @param {import("./RPCTransport.js").default} transport
     * @param {TInstRaw} instance
     */
    constructor(transport, instance) {
        super(transport);

        /** @type {Map<number, PendingRPCReceived>} **/
        this.pendingReceived = new Map();

        /** @type {TInstDesc} **/
        // @ts-ignore
        this.instance = instance;

        /** @type {rpc.ClassMethodsDescriptor<TInstRaw>} **/
        this.descriptor = this.instance.constructor.RPC_DESCRIPTOR;
    }

    /**
     * @param {number} msgId
     * @param {string} methodName
     * @param {any[]} args
     */
    async localCallWrapper(msgId, methodName, args) {
        const pending = new PendingRPCReceived(msgId, methodName, ++this.outgoingId);

        this.pendingReceived.set(pending.responseId, pending);

        try {
            /** @type {(...args: any)=> any} **/
            // @ts-ignore
            const fn = this.instance[methodName];
            const res = fn.call(this.instance, ...args);

            const descripton = this.descriptor[methodName];
            if(descripton.type === "promise") {
                const realRes = await res;
                this.resolveReceived(pending.responseId, msgId, realRes);
            }
            else {
                this.resolveReceived(pending.responseId, msgId, res);
            }
        }
        catch(e) {

        }
    }

    /**
     * @param {number} id
     * @param {number} replyTo
     * @param {any} data
     */
    resolveReceived(id, replyTo, data) {
        /** @type {rpc.MessageResponseOk} **/
        const responseMsg = {
            id: id,
            responseTo: replyTo,
            type: "response",
            data: data
        };

        this.sendPayload(responseMsg);
    }

    /**
     * @param {number} msgId
     * @param {string} methodName
     * @param {any[]} args
     */
    executeLocalCall(msgId, methodName, args) {
        if(typeof this.descriptor[methodName] != "object" || this.descriptor[methodName] == null) {
            this.sendPayload({
                type: "response_error",
                responseTo: msgId,
                id: ++this.outgoingId,
                error: "Invalid call",
                stack: [],
                errorProps: null
            });
        }

        this.localCallWrapper(msgId, methodName, args);
    }
};

export default RPCClient;