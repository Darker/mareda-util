/**
 * This file contains simple event emitter. As opposed to DOM, events are dispatched simply by name
 * and arguments.
 */


/**
 * @typedef {Object} EventOptions
 * @property {boolean} forceAsync force the event to be dispatched in a new stack frame, this will make it run after sync listeners
 * @property {boolean} once only emit event once
 * 
 */

class Listener {
    /**
     * 
     * @param {string} name 
     * @param {function} callback 
     * @param {boolean} forceAsync 
     * @param {boolean} once 
     */
    constructor(name, callback, forceAsync, once) {
        this.name = name;
        this.callback = callback;
        this.forceAsync = forceAsync;
        this.once = once;
    }
    dispatch(...args) {
        this.callback(...args);
    }
}

class EmitError extends Error {
    /**
     * 
     * @param {string} eventName 
     * @param {Error[]} errors 
     */
    constructor(eventName, errors = []) {
        super("One or more exceptions thrown while emitting event "+eventName);
        this.eventName = eventName;
        this.errors = errors;
    }
}

class Events {
    constructor() {
        /** @type {{[eventName: string]:Listener[]}} **/
        this._listeners = {};
        /** @type {{listeners: Listener[], args: any[]}[]} **/
        this._emitLaterQueue = [];
    }
    /**
     * 
     * @param {string} eventName 
     * @param {function} callback 
     * @param {EventOptions} options 
     */
    on(eventName, callback, options={}) {
        if(typeof this._listeners[eventName] == "undefined") {
            this._listeners[eventName] = [];
        }
        const listener = new Listener(eventName, callback, options.forceAsync === true, options.once === true);
        this._listeners[eventName].push(listener);
        return listener;
    }
    emit(eventName, ...args) {
        const remove = [];
        const emitLater = [];

        const listeners = this._listeners[eventName];
        const errors = [];
        
        for(let i=0, l=listeners.length; i<l; ++i) {
            const listener = listeners[i];
            if(listener.once) {
                remove.push(i);
            }
            if(listener.forceAsync) {
                emitLater.push(listener);
            }
            else {
                try {
                    listener.dispatch(...args);
                }
                catch(e) {
                    errors.push(e);
                }
            }
        }
        if(remove.length > 0) {
            for(const index of remove) {
                listeners.splice(index, 1);
            }
        }
        if(emitLater.length > 0) {
            this._emitLater(emitLater, args);
        }
    }

    /**
     * 
     * @param {string|Listener} listener either name followed by callback, or a specific listener instance
     * @param {function} callback callback to remove if listener was event name
     */
    off(listener, callback) {
        if(listener instanceof Listener) {
            const listeners = this._listeners[listener.name];
            if(listeners instanceof Array) {
                const i = listeners.findIndex((x)=>x==listener);
                listeners.splice(i, 1);
            }
        }
        else {
            const listeners = this._listeners[listener.name];
            if(typeof callback === "function") {
                if(listeners instanceof Array) {
                    const indices = [];
                    for(let )
                }
            }
            else {
                listeners.length = 0;
            }
        }
    }
    /**
     * Registers listeners to be dispateched in another stack frame
     * @param {Listener[]} listeners 
     * @param {any[]} args 
     */
    _emitLater(listeners, args) {
        this._emitLaterQueue.push({listeners, args});

        if(typeof this._emitLaterTimeout != "number") {
            this._emitLaterTimeout = setTimeout(()=>{
                this._emitLaterTimeout = null;
                for(const batch of this._emitLaterQueue) {
                    for(const listener of batch.listeners) {
                        try {
                            listener.dispatch(...batch.args);
                        }
                        catch(e) {
                            console.trace(e);
                        }
                    }
                }
            });
        }
    }
};

export default Events;