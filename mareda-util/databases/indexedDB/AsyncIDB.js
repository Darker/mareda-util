import SimpleMutex from "../../promises/concurrency/SimpleMutex.js";
import DeferredPromise from "../../promises/DeferredPromise.js";

/**
 * 
 * @param {string} name 
 * @param {number} version 
 * @param {(db: IDBDatabase, version: {from: number, to: number}, transaction: any) => void} upgradeHandler
 * @param {IDBFactory} idbFactory 
 * @returns {Promise<{db: IDBDatabase, upgradeNeeded: false}|{db: IDBDatabase, upgradeNeeded: true, from: number, to: number}>}
 */
function awaitOpenIDB(name, version, upgradeHandler, idbFactory) {
    return new Promise((resolve, reject) => {
        const openReq = idbFactory.open(name, version);

        function successListener() {
            resolve({upgradeNeeded: false, db: openReq.result});
        }

        openReq.addEventListener("success", successListener, {once: true});
        openReq.addEventListener("upgradeneeded", function(e) {
            //openReq.removeEventListener("success", successListener);
            //resolve({upgradeNeeded: true, db: openReq.result, from: e.oldVersion, to: e.newVersion});
            upgradeHandler(openReq.result, {from: e.oldVersion, to: e.newVersion}, openReq.transaction);
        });

        /**
         * 
         * @param {Event & IDBVersionChangeEvent} e 
         */
        function errorListener(e) {
            if(typeof e.oldVersion != "undefined") {
                reject(new Error(`Upgrade blocked by an open instance. cur: ${e.oldVersion} needed: ${e.newVersion}`));
            }
            else {
                reject(openReq.error);
            }
            openReq.removeEventListener("blocked", errorListener);
            // @ts-ignore
            openReq.removeEventListener("error", errorListener);
        }

        openReq.addEventListener("blocked", errorListener, {once: true});
        // @ts-ignore
        openReq.addEventListener("error", errorListener, {once: true});
    });
}

/**
 * @template {any} TReq
 * @param {IDBRequest<TReq>} request 
 * @returns {Promise<TReq>}
 */
function awaitRequestComplete(request) {
    return new Promise(function(resolve, reject) {
        request.addEventListener("success", ()=>{
            resolve(request.result);
        });
        request.addEventListener("error", ()=>{
            reject(request.error);
        })
    });
}

class AsyncIDB {
    /**
     * 
     * @param {string} name 
     * @param {number} version 
     * @param {IDBFactory} idbOverride 
     */
    constructor(name, version, idbOverride = indexedDB) {
        this.openPromise = new DeferredPromise(
            awaitOpenIDB(
                name,
                version,
                (db, ver, tx)=>{this._upgradeWrapper(db, ver.from, ver.to, tx)},
                idbOverride
        ));

        /** @private */
        this.isUpgrading = false;

        this.dbLock = new SimpleMutex();
    }

    /**
     * @param {IDBDatabase} db
     * @param {number} from 
     * @param {number} to 
     */
    upgrade(db, from, to) {
        throw new Error("Upgrade not implemented!");
    }

    /**
     * @private
     * @param {IDBDatabase} db
     * @param {number} from 
     * @param {number} to 
     * @param {IDBTransaction} tx
     */
    _upgradeWrapper(db, from, to, tx) {
        this.isUpgrading = true;
        try {
            this.upgrade(db, from, to);
        }
        finally {
            this.isUpgrading = false;
        }
    }

    async getDb() {
        const db = await this.openPromise.get();

        return db.db;
    }

    /**
     * @protected
     * @param {IDBDatabase} db
     * @param {string} name 
     * @param {object} [param1]
     * @param {string} [param1.keyPath]
     * @param {boolean} [param1.autoIncrement]
     * @param {{name: string, keyPath: string|string[], opts?: IDBIndexParameters}[]} [param1.indices]
     */
    createObjectStore(db, name, {keyPath, autoIncrement = false, indices = []} = {}) {
        if(!this.isUpgrading) {
            throw new Error("Schema changes are only allowed during an upgrade!");
        }

        const objectStore = db.createObjectStore(name, {
            keyPath: keyPath,
            autoIncrement: autoIncrement
        });
        
        for(const indice of indices) {
            objectStore.createIndex(indice.name, indice.keyPath, indice.opts);
        }
        return objectStore;
    }

    /**
     * 
     * @param {string} storeName 
     * @param {IDBValidKey} keyValue 
     */
    async lookup(storeName, keyValue) {
        const db = await this.getDb();
        const req = db.transaction([storeName], "readonly").objectStore(storeName).get(keyValue);
        return awaitRequestComplete(req);
    }


    /**
     * 
     * 
     * @param {string} storeName 
     * @param {object} value
     * @param {IDBValidKey} [keyValue]
     */
    async add(storeName, value, keyValue) {
        const db = await this.getDb();
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);

        const req = store.keyPath
            ? store.add(value) 
            : store.add(value, keyValue); 

        return awaitRequestComplete(req);
    }

    /**
     * 
     * 
     * @param {string} storeName 
     * @param {IDBValidKey} [keyValue]
     */
    async delete(storeName, keyValue) {
        const db = await this.getDb();
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.delete(keyValue);
        return awaitRequestComplete(req);
    }

};

export default AsyncIDB;