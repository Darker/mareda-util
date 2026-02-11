
import PendingRPC from "./PendingRPC.js";

/**
 * @typedef {import("./RPCTransport.js").default} RPCTransport
 **/

class RPCNode {
    /**
     * @param {RPCTransport} transport
     */
    constructor(transport) {
        this.transport = transport;
        this.transport.addReceiveListener(
            // @ts-ignore
            (data)=>this.handleReceived(data)
        );

        /** @type {Map<number, PendingRPC>} **/
        this.pendingSent = new Map();
        /** @type {Map<number, PendingRPC>} **/
        this.pendingGenerators = new Map();
        this.outgoingId = 0;
    }


    /**
     * 
     * @param {rpc.Message} message 
     */
    handleReceived(message) {
        if(message.type == "response") {
            // find source
            const sent = this.pendingSent.get(message.responseTo);
            this.pendingSent.delete(message.responseTo);
            sent.resolutionPromise.resolve(message.data);
        }
        else if(message.type == "response_error") {
            const sent = this.pendingSent.get(message.responseTo);
            this.pendingSent.delete(message.responseTo);
            const err = new Error(message.error);
            
            sent.resolutionPromise.reject(err);
        }
        else if(message.type == "request") {
            this.executeLocalCall(message.id, message.methodName, message.args);
        }
    }

    executeLocalCall(msgId, methodName, args) {
        throw new Error("Not implemented in abstract RPCNode!");
    }

    /**
     * @param {string} methodName
     * @param {any[]} args 
     */
    async executeRPC(methodName, args) {
        /** @type {rpc.Message} **/
        const msg = {
            id: ++this.outgoingId,
            type: "request",
            methodName: methodName,
            args: args
        };
        const pending = new PendingRPC();
        this.pendingSent.set(msg.id, pending);

        this.sendPayload(msg);

        return await pending.waitPromise();
    }

    /**
     * @param {Error} errorInst
     * @param {number} respondingTo
     */
    async sendError(errorInst, respondingTo) {
        /** @type {rpc.MessageResponseErr} */
        const msg = {
            id: ++this.outgoingId,
            type: "response_error",
            responseTo: respondingTo, 
            error: errorInst.message ?? String(errorInst),
            stack: (errorInst.stack ?? "").split("\n"),
            errorProps: {}
        };

        // Copy enumerable custom properties (very useful for RPC)
        for (const key of Object.keys(errorInst)) {
            // @ts-ignore
            const val = errorInst[key];
            
            if(typeof val == "string" || typeof val == "boolean" || typeof val == "number") {
                msg.errorProps[key] = val;
            }
            else if(typeof val == "object") {
                if(val === null) {
                    msg.errorProps[key] = null;
                }
                else if(val instanceof Date) {
                    msg.errorProps[key] = val.toISOString();
                }
                else if(val instanceof URL) {
                    msg.errorProps[key] = String(val);
                }
            }
            else if(typeof val == "bigint") {
                msg.errorProps[key] = val.toString();
            }
        }

        this.sendPayload(msg);
    }


    /**
     * 
     * @param {rpc.Message} message 
     */
    sendPayload(message) {
        this.transport.send(message);
    }
};

export default RPCNode;