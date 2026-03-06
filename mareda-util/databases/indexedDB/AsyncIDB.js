import DBNoSuchRowError from "../../errors/DBNoSuchRowError.js";
import ConditionVariable from "../../promises/concurrency/ConditionVariable.js";
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

/**
 * @template {any} TValue
 */
class AsyncCursor {
    /**
     * @param {IDBCursorWithValue} cursor
     */
    constructor(cursor) {
        this.cursor = cursor;
    }

    continue() {
        this.cursor.continue();
    }

    async delete() {
        return await awaitRequestComplete(this.cursor.delete());
    }

    /**
     * 
     * @param {any} value 
     */
    async update(value) {
        return await awaitRequestComplete(this.cursor.update(value));
    }

    /** @type {TValue} **/
    get value() {
        return this.cursor.value;
    }
}

/**
 * @param {IDBRequest<IDBCursorWithValue>} request 
 * @param {object} [param1]
 * @param {boolean} [param1.autoContinue] if true, continue is called after each yield
 */
async function * generateCursorResults(request, {autoContinue = false} = {}) {
    /** @type {IDBCursorWithValue} **/
    let cursor = null;

    /** @type {DOMException | AggregateError} **/
    let error = null;

    /** @type {ConditionVariable<IDBCursorWithValue?>} **/
    const cursorCondition = new ConditionVariable();

    /**
     * 
     * @param {Event} event 
     */
    function cursorListener(event) {
        console.log("IDBCleanupManager AsyncIDB cursorListener ", event);
        /** @type {IDBCursorWithValue?} **/
        // @ts-ignore
        cursor = event?.target?.result;
        cursorCondition.wakeAll(cursor);
    }
    request.onerror = function(e) {
        if(error === null) {
            error = request.error;
        }
        else {
            error = AggregateError([error, request.error]);
        }
        cursorCondition.wakeAll(null);
    }
    try {
        request.addEventListener("success", cursorListener);
        while(true) {
            const currentCursor = await cursorCondition.wait();
            console.log("IDBCleanupManager AsyncIDB currentCursor ", currentCursor);
            if(error) {
                throw error;
            }
            if(!currentCursor) {
                console.log("IDBCleanupManager AsyncIDB currentCursor END", currentCursor);
                break;
            }
            else {
                console.log("IDBCleanupManager AsyncIDB currentCursor YIELD", currentCursor);
                yield currentCursor;

                if(autoContinue) {
                    console.log("IDBCleanupManager AsyncIDB currentCursor CONTINUE", currentCursor);
                    currentCursor.continue();
                }
            }
        }
    }
    finally {
        console.log("IDBCleanupManager AsyncIDB finalizer");
        request.removeEventListener("success", cursorListener);
        cursor = null;
    }
}

const IGNORED_VALUE = Object.freeze({});
class AsyncIDB {

    /**
     * this is used as a placeholder during update by default
     * @readonly
     * @type {object}
     */
    static IGNORED_VALUE = IGNORED_VALUE

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
     * @param {IDBTransaction} tx
     * @param {number} from 
     * @param {number} to 
     */
    upgrade(db, tx, from, to) {
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
            this.upgrade(db, tx, from, to);
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
        return await awaitRequestComplete(req);
    }

    /**
     * 
     * @param {string} storeName 
     * @param {IDBTransactionMode} mode 
     * @param {object} [param1]
     * @param {boolean} [param1.autoContinue] if true, continue is called after each yield
     */
    async * scan(storeName, mode, {autoContinue = false} = {}) {
        const db = await this.getDb();
        console.log("IDBCleanupManager IDB open for scan");
        const transaction = db.transaction([storeName], mode);
        const store = transaction.objectStore(storeName);
        let aborted = false;
        try {
            const helper = new AsyncCursor(null);
            console.log("IDBCleanupManager AsyncIDB dursor start");
            for await(const cursor of generateCursorResults(store.openCursor(), {autoContinue})) {
                helper.cursor = cursor;
                yield helper;
            }
        }
        catch(e) {
            transaction.abort();
            aborted = true;
            throw e;
        }
        finally {
            if(!aborted && mode == "readwrite") {
                transaction.commit();
            }
        }
    }

    /**
     * 
     * @param {string} storeName 
     * @param {string} indexName 
     * @param {IDBValidKey} keyValue 
     */
    async lookupIndex(storeName, indexName, keyValue) {
        const db = await this.getDb();
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);

        const req = index.get(keyValue);
        return await awaitRequestComplete(req);
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

        return await awaitRequestComplete(req);
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

    /**
     *
     * @param {string} storeName
     * @param {IDBValidKey} key
     * @param {Record<string, boolean|string|number|bigint|null|object>} patch fields to update
     * @param {object} ignoredValue set this to whatever, if an entry in patch EXACTLY equals (===), it is skipped
     */
    async update(storeName, key, patch, ignoredValue = AsyncIDB.IGNORED_VALUE) {
        const db = await this.getDb();
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);

        // 1. Read existing value
        const existing = await awaitRequestComplete(store.get(key));

        if (!existing) {
            tx.abort();
            throw new DBNoSuchRowError(key, storeName);
        }

        // 2. Apply patch (shallow merge)
        for (const [k, v] of Object.entries(patch)) {
            if(v === ignoredValue) {
                continue;
            }
            existing[k] = v;
        }

        // 3. Write back
        
        const req = store.keyPath ? store.put(existing) : store.put(existing, key);
        return await awaitRequestComplete(req);
    }

};

Object.defineProperty(AsyncIDB, "IGNORED_VALUE", {configurable: false, enumerable: false, writable: false});

export default AsyncIDB;

export {AsyncCursor};