
/**
 * 
 * @param {number} timeout 
 * @param {object} param1 
 * @param {AbortSignal} [param1.abortSignal]
 * @param {boolean} [param1.abortRejects] if true abort signal causes rejection
 */
function timeoutPromise(timeout, {abortSignal=null, abortRejects=true}={}) {
    return new Promise(
        function (resolve, reject) {
            if(abortSignal && abortSignal.aborted) {
                if(abortRejects) {
                    reject(new Error("AbortError"));
                }
                else {
                    resolve();
                }
                return;
            }
            let timeoutId;
            function handleAbort() {
                clearTimeout(timeoutId);
                if(abortRejects) {
                    reject(new Error("AbortError"));
                }
                else {
                    resolve();
                }
            }
            function handleSuccess() {
                if(abortSignal) {
                    abortSignal.removeEventListener("abort", handleAbort);
                }
                resolve();
            }
            timeoutId = setTimeout(handleSuccess, timeout);
            if(abortSignal) {
                abortSignal.addEventListener("abort", handleAbort, {once: true});
            }
            
        }
    );
}

export default timeoutPromise;