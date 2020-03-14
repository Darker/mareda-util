/**
 * Iterate over all documents in all frames
 * @returns {IterableIterator<Document>}
 * */
function* allDocuments() {
    const stack = [document];
    while (stack.length > 0) {
        const currentDoc = stack.shift();
        // add nested frames
        for (const frame of currentDoc.querySelectorAll("iframe")) {
            try {
                const w = frame.contentWindow;
                const key = "t" + Math.round(Math.random() * 1e5);
                w[key] = true;
                if (w[key] === true) {
                    delete w[key];
                    stack.push(w.document);
                }
            }
            catch (e) { /*Ignore inacessible iframes*/ }
        }
        // Yield current document
        yield currentDoc;
    }
}

/**
 * Checks if any of parent nodes of elm has a class name
 * @param {HTMLElement} elm the starting node
 * @param {string} className
 * @param {HTMLElement} stopAtElm if this parent is reached, search stops
**/
function findParentByClass(elm, className, stopAtElm) {
    while (elm != null && elm != stopAtElm) {
        if (elm.nodeType == 1 && elm.classList.contains(className)) {
            return elm;
        }
        elm = elm.parentNode;
    }
    return null;
}

/**
 * Checks if any of parent nodes of elm has given id
 * @param {HTMLElement} elm the starting node
 * @param {string} id
 * @param {HTMLElement} stopAtElm if this parent is reached, search stops
**/
function findParentById(elm, id, stopAtElm) {
    while (elm != null && elm != stopAtElm) {
        if (elm.nodeType == 1 && elm.id == id) {
            return elm;
        }
        elm = elm.parentNode;
    }
    return null;
}