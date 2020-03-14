function Timeout(timeout) {
    return new Promise(function (resolve) { setTimeout(resolve, timeout); });
}

export default Timeout;