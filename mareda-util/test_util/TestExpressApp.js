
import http from "http";

/**
 * 
 * @param {Express.ExpressImpl} app 
 * @param {number} port 
 * @param {string} ip 
 * @returns {Promise<ReturnType<http.createServer>>}
 */
function expressListen(app, port, ip) {
    return new Promise((resolve, reject)=>{
        let server = null;
        server = app.listen(port, ip, (e)=>{
            if(e) {
                reject(e);
            }
            else {
                resolve(server);
            }
        });
    });
}
/**
 * 
 * @param {http.Server} server 
 */
function serverClose(server) {
    return new Promise((resolve, reject)=>{
        server.close(function(e) {
            if(e) {
                reject(e);
            }
            else {
                resolve();
            }
        });
    });
}

class TestExpressApp {
    /**
     * 
     * @param {Express.ExpressImpl} expressInst
     */
    constructor(expressInst) {
        this.app = expressInst;
        this.port = -1;
        this.server = null;
        this.destroyed = false;
    }
    async start() {
        let port = 3843;

        if(this.port != -1) {
            if(this.destroyed) {
                throw new Error("Server already destroyed!");
            }
            return this.port;
        }

        while(port < 4000) {
            try {
                this.server = await expressListen(this.app, port, "127.0.0.1");
                break;
            }
            catch(e) {
                ++port;
                if(port >= 4000) {
                    throw e;
                }
            }
        }
        this.port = port;
        return port;
    }
    async cleanup() {
        if(this.destroyed) {
            return;
        }
        this.destroyed = true;
        try {
            await serverClose(this.server);
        }
        catch(e) {
            this.destroyed = false;
            throw e;
        }
    }
};

export default TestExpressApp;