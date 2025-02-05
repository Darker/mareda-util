
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
        const server = http.createServer(app);
        server.listen(port, ip, )
        app.listen(port, ip, (e)=>{
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
    }
    async start() {
        let port = 3843;

        while(port < 4000) {
            try {
                this.server = await expressListen(this.app, port, "127.0.0.1");
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
        await serverClose(this.server);
    }
};

export default TestExpressApp;