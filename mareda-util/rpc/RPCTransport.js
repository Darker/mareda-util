
/**
 * @typedef {{handleReceived: (data:any)=>void} & object} ReceiveListener
 */

class RPCTransport {
    constructor() {
        /**
         * @type {ReceiveListener[]}
         */
        this.receiveListeners = [];
    }

    /**
     * Sends the payload to the other side
     * @param {any} anyData 
     */
    async send(anyData) { throw new Error("Not implemented!"); }

    /**
     * This function is called for every received payload
     * @param {ReceiveListener} f callback that gets the data in the same format as the other side sent it
     */
    addReceiveListener(f) {
        this.receiveListeners.push(f);
    }

    /**
     * This is a hint function. If it hints it uses JSON, caller should cleanup non-JSON types.
     * The point of this is to give the caller a chance to expect serialization errors later.
     * 
     * If you do some smart cleanup yourself but still use JSON, then you can just return false.
     * @returns {boolean}
     */
    usesJSON() { return false; }
};

class RPCTransportWebWorker extends RPCTransport {
    /**
     * 
     * @param {MessagePort} workerPort 
     */
    constructor(workerPort) {
        super();
        this.port = workerPort;
        this.port.addEventListener("message", (e)=>{this.receive(e.data)});
        this.port.start();

    }

    /**
     * @param {any} data
     */
    receive(data) {
        console.log("RPCTransportWebWorker received ", data, " informing", this.receiveListeners.length, "listeners");
        for(const rec of this.receiveListeners) {
            this.informListener(rec, data);
        }
    }

    /**
     * @param {any} data
     */
    async send(data) {
        console.log("RPCTransportWebWorker sent ", data);
        this.port.postMessage(data);
    }

    /**
     * @param {ReceiveListener} listener
     * @param {any} data
     */
    informListener(listener, data) {
        try {
            listener.handleReceived(data);
        }
        catch(e) {
            console.error("RPCTransportWebWorker listener error: ", e);
            return e;
        }
        return null;
    }
}

RPCTransport.WebWorker = RPCTransportWebWorker;

export default RPCTransport;