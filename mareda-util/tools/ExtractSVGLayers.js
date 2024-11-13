// This script will extract layers from inkscape SVG into individual files
import JSDOM_m from "jsdom";
import FileAccess from "../promises/fs/FileAccess.js";
import ReadFile from "../promises/fs/ReadFile.js";
import * as HelperGenerators from "../iterators/HelperGenerators.js";
import * as path from "path";
import WriteFile from "../promises/fs/WriteFile.js";
import MakeDirectory from "../promises/fs/MakeDirectory.js";

/**
 * @typedef {import("jsdom")} JSDOM_t
 * */
/** @type {JSDOM_t} **/
const JSDOM = JSDOM_m;

const NODE_TYPE = {
    TEXT: 3,
    ELEMENT: 1
};

const XML_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`;

const target = process.argv[2];

/**
 * 
 * @param {SVGElement} node
 */
function isLayerNode(node) {
    return node.getAttribute("inkscape:groupmode") == "layer" && !!node.getAttribute("inkscape:label");
}

/**
 *
 * @param {SVGElement} node
 */
function isDeepmostLayerNode(node) {
    if (isLayerNode(node)) {
        const elms = [...node.getElementsByTagName("g")];
        for (const layer of HelperGenerators.filtered(elms, isLayerNode)) {
            return false;
        }
        return true;
    }
    return false;
}

class NodeIdPair {
    /**
     * 
     * @param {SVGElement} node
     * @param {number} id
     */
    constructor(node, id) {
        this.node = node;
        this.id = id;
    }
    get name() {
        return "node_" + this.node.tagName + "_" + this.id;
    }
}

class NodeMap {
    constructor() {
        /** @type {NodeIdPair[]} **/
        this.map = [];
        this.__id = 0;
    }
    /**
     * 
     * @param {SVGElement} node
     */
    createNode(node, silent = false) {
        const pair = this.getNodeIdPair(node);
        if(!silent)
            console.log(`const ${pair.name} = document.createElement("${node.tagName}");`);
        return pair;
    }
    setAttribute(node, attrname, value) {
        const pair = this.getNodeIdPair(node);
        console.log(`${pair.name}.setAttribute("${attrname}", "${value}");`);
    }
    appendChild(node, childNode) {
        const pairNode = this.getNodeIdPair(node);
        const pairChild = this.getNodeIdPair(childNode);
        console.log(`${pairNode.name}.appendChild(${pairChild.name});`);
    }

    reset() {
        this.map.length = 0;
        this.__id = 0;
    }
    /**
     * 
     * @param {SVGElement} node
     */
    getNodeIdPair(node) {
        for (const pair of this.map) {
            if (pair.node == node) {
                return pair;
            }
        }
        const pair = new NodeIdPair(node, ++this.__id);
        this.map.push(pair);
        return pair;
    }
}

const NODE_MAP = new NodeMap();

/**
 * 
 * @param {Document} sourceDocument
 * @param {DOMParser} domParser
 */
function cloneDocumentMain(sourceDocument, domParser) {
    const newDocument = domParser.parseFromString(XML_HEADER + `<svg xmlns="http://www.w3.org/2000/svg"></svg>`, "image/svg+xml");

    //console.log(`const document = domParser.parseFromString(\`${XML_HEADER}<svg xmlns="http://www.w3.org/2000/svg"></svg>\`, "image/svg+xml");`);
    //const pair = NODE_MAP.createNode(newDocument.getElementsByTagName("svg")[0], true);
    //console.log(`const ${pair.name} = document.getElementsByTagName("svg")[0];`);

    const srcSvg = sourceDocument.getElementsByTagName("svg")[0];
    const tgtSvg = newDocument.getElementsByTagName("svg")[0];
    cloneAttributes(srcSvg, tgtSvg);
    return newDocument;
}

/**
 * 
 * @param {SVGElement} source
 * @param {SVGElement} target
 */
function cloneAttributes(source, target) {
    for (const attr of source.getAttributeNames()) {
        if (attr == "xmlns" || attr.indexOf(":")!=-1) {
            continue;
        }
        const value = source.getAttribute(attr).replace(/display:none($|;)/i, "");
        //console.log(`<${source.tagName} ${attr}="${value}">`);
        if (target.getAttribute(attr)) {
            console.warn("ATTRIBUTE OVERRIDE: "`<${source.tagName} ${attr}="${target.getAttribute(attr)}">`);
        }
        if (value.indexOf("disp") != -1) {
            console.log(`<${source.tagName} ${attr}="${value}">`);
        }
        target.setAttribute(attr, value);
        //NODE_MAP.setAttribute(target, attr, value);
    }
}

class DeepCloneHelper {
    /**
     * 
     * @param {SVGElement} origChild
     * @param {SVGElement} newParent
     */
    constructor(origChild, newParent) {
        //this.origParent = origParent;
        this.newParent = newParent;
        this.origChild = origChild;
    }
}
/**
 * 
 * @param {SVGElement} layer
 * @param {Document} targetDocument
 */
function deepCloneLayer(layer, targetDocument) {
    /** @type {DeepCloneHelper[]} **/
    const stack = [];
    stack.push(new DeepCloneHelper(layer, targetDocument.getElementsByTagName("svg")[0]));
    while (stack.length > 0) {
        const item = stack.shift();
        // clone the node
        const newNode = targetDocument.createElement(item.origChild.tagName);

        //NODE_MAP.createNode(newNode);

        cloneAttributes(item.origChild, newNode);
        item.newParent.appendChild(newNode);
        //NODE_MAP.appendChild(item.newParent, newNode);
        // add all children to the stack
        for (const child of item.origChild.childNodes) {
            if (child.nodeType == NODE_TYPE.TEXT) {
                newNode.appendChild(targetDocument.createTextNode(child.data));
            }
            else {
                stack.push(new DeepCloneHelper( child, newNode));
            }
        }
    }
}

/**
 * 
 * @param {SVGElement} root
 * @param {[number, number]} offset
 */
function applyTranslate(root, offset = [0,0]) {
    const elements = [root];
    const REGEX_TRANSLATE = /translate\((-?[0-9]+(?:\.[0-9]+)?)\s*,\s*(-?[0-9]+(?:\.[0-9]+)?)\)/;
    const REGEX_TRANSLATE_PATH = /^m\s+(-?[0-9]+(?:\.[0-9]+)?)\s*,\s*(-?[0-9]+(?:\.[0-9]+)?)/i;

    while (elements.length > 0) {
        const current = elements.shift();

        // if current is a bottom most layer, aplly the transform on it and leave it at that
        if (isDeepmostLayerNode(current)) {
            current.setAttribute("transform", `translate(${offset[0]},${offset[1]})`);
            continue;
        }

        const isPath = current.tagName.toLowerCase() == "path";

        //console.log(current, "current");
        if (current.hasAttribute("transform") && !isPath) {
            const transform = current.getAttribute("transform");
            // parse translation
            const match = REGEX_TRANSLATE.exec(current.getAttribute("transform"));
            if (match) {
                const newOffset = [offset[0] + 1 * match[1], offset[1] + 1 * match[2]];
                if (Number.isNaN(newOffset[0]) || Number.isNaN(newOffset[1])) {
                    console.log(newOffset);
                    console.log(match);
                    console.log(transform);
                    throw new Error("invalid transform value")
                }
                current.removeAttribute("transform");
                applyTranslate(current, newOffset);
            }
            else {
                throw new Error("Cannot parse transform: "+ "\""+transform+"\"");
            }
        }
        else {
            // apply transform to current if applicable
            if (isPath) {
                const path = current.getAttribute("d");
                current.setAttribute("d", path.replace(REGEX_TRANSLATE_PATH, (all, x, y) => { return "m " + (1 * x + offset[0]) + ", " + (1 * y + offset[1]); }));
                //console.log("Path translated: ", path, current.getAttribute("d"));
            }

            for (const child of current.childNodes) {
                if(child.nodeType == NODE_TYPE.ELEMENT)
                    elements.push(child);
            }
        }
    }
}

(async () => {
    if (await FileAccess(target, FileAccess.MODE.READ)) {
        const targetBaseName = path.basename(target).replace(/\.svg$/i, "");
        const targetDir = path.join(path.dirname(target), targetBaseName);
        await MakeDirectory(targetDir);

        const dom = new JSDOM.JSDOM("");
        const DOMParser = dom.window.DOMParser;
        const parser = new DOMParser();

        const document = parser.parseFromString(await ReadFile(target), "image/svg+xml");

        applyTranslate(document.firstElementChild);

        const elms = [...document.getElementsByTagName("g")];
        for (const layer of HelperGenerators.filtered(elms, isDeepmostLayerNode)) {
            //NODE_MAP.reset();
            // make sure toi remove display none
            layer.style.display = "";
            const layer_name = layer.getAttribute("inkscape:label");
            console.log("Processing " + layer_name);

            const newDocument = cloneDocumentMain(document, parser);
            try {
                deepCloneLayer(layer, newDocument);
                // convert to text
                console.log("Serializing to XML\r\n\r\n");
                const xmlText = newDocument.documentElement.outerHTML.replace(/xmlns=""\s*/g, "");
                await WriteFile(path.join(targetDir, layer_name + ".svg"), XML_HEADER+"\n"+xmlText);
            }
            catch (e) {
                console.trace(e);
                continue;
            }
        }
    }
    else {
        console.error("Cannot open ", target);
        process.exit(1);
    }

})();