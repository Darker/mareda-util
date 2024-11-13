import JSDOM_m from "jsdom";
/**
 * @typedef {import("jsdom")} JSDOM_t
 * */
/** @type {JSDOM_t} **/
const JSDOM = JSDOM_m;

const dom = new JSDOM.JSDOM("");
const DOMParser = dom.window.DOMParser;
const parser = new DOMParser();

const document = parser.parseFromString(`<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg"></svg>`, "image/svg+xml");
const node_svg_1 = document.getElementsByTagName("svg")[0];

node_svg_1.setAttribute("width", "128");
node_svg_1.setAttribute("height", "128");
node_svg_1.setAttribute("viewBox", "0 0 33.866666 33.866668");
node_svg_1.setAttribute("version", "1.1");
node_svg_1.setAttribute("id", "svg8");
const node_g_2 = document.createElement("g");
node_g_2.setAttribute("id", "layer10");
node_g_2.setAttribute("style", "display:none");
node_svg_1.appendChild(node_g_2);
const node_path_3 = document.createElement("path");
node_path_3.setAttribute("style", "fill:#5dd05d;fill-opacity:1;stroke:#000000;stroke-width:0.26458335px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1");
node_path_3.setAttribute("d", "M 9.1281252,-0.00222895 7.4414064,4.1010418 7.209896,11.1125 l 0.2315104,3.439584 0.5953126,3.604948 3.075781,4.630208 3.770313,2.745052 4.861719,0.628386 3.505729,-0.529167 3.439583,-0.165365 3.274219,-0.727604 3.903639,0.132289 V 9.301758 L 29.434897,8.8635419 26.52448,9.2604169 24.275521,9.0619794 22.952605,8.0697919 22.754167,6.6145835 23.614063,4.2333334 23.812501,2.1166668 24.407813,0.33072928 24.738542,-0.06614573");
node_path_3.setAttribute("id", "path1107");
node_g_2.appendChild(node_path_3);

console.log(document.documentElement.outerHTML);