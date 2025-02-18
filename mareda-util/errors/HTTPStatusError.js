import isNonEmptyString from "../strings/isNonEmptyString.js";

function constructErrorMsg(method, url, statusCode) {
    if(typeof method != "string") {
        method = "";
    }
    return "Failed "+method.toUpperCase()+(isNonEmptyString(url) ? " "+url:"")+" status: "+statusCode;
}

class HTTPStatusError extends Error {
    /**
     * 
     * @param {number} statusCode 
     * @param {object} param1
     * @param {string|null} [param1.url]
     * @param {ErrorOptions} [param1.options]
     * @param {"get"|"post"|"options"|"put"|"delete"} [param1.method]
     * @param {string} [param1.message] override default message
     */
    constructor(statusCode, {url=null, options=null, method="get", message= ""}={}) {
        super(
            isNonEmptyString(message) ? message : constructErrorMsg(method, url, statusCode),
            options
        );
        this.code = statusCode;
        this.url = typeof url == "string" ? url : null;
        this.method = method;
    }
};

export default HTTPStatusError;