function timeoutPromise(timeout) {
    return new Promise(function (resolve) { setTimeout(resolve, timeout); });
}

export default timeoutPromise;