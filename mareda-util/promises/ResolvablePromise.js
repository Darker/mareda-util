/**
 * Simple promise wrapper that allows you to resolve or reject a promise later.
 * 
 * */
class ResolvablePromise {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    resolve(result) {
        this._resolve(result);
    }
    reject(error) {
        this._reject(error);
    }
}

export default ResolvablePromise;