import Exec from "./promises/Exec.js";

(async () => {
    const resilt = await Exec("echo", ["test"], { stdoutTarget: process.stdout, stderrTarget: process.stderr });
    console.log("Stdout: ", resilt);
})();



//import ObjectConversion from "./objects/ObjectConversion.js";

////ObjectConversion.default.
//const hash = ObjectConversion.toHash({
//    a: "dsafdsa",
//    b: 21423,
//    c: {
//        d: [1, 2, 3, 4, 5, 6]
//    }
//});
//console.log(hash)