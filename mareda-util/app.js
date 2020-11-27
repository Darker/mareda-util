import ObjectConversion from "./objects/ObjectConversion.js";

//ObjectConversion.default.
const hash = ObjectConversion.toHash({
    a: "dsafdsa",
    b: 21423,
    c: {
        d: [1, 2, 3, 4, 5, 6]
    }
});
console.log(hash)