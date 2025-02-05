import HTTPStatusError from "../../../errors/HTTPStatusError.js";

describe("HTTPStatusError test", ()=>{
    it("Constructs without errors", ()=>{
        let testError = new HTTPStatusError(404);
        expect(testError.code).toBe(404);
        expect(testError.url).toBe(null);

        testError = new HTTPStatusError(500, {url: "http://www.example.net", method:"post"});
        expect(testError.code).toBe(500);
        expect(testError.url).toBe("http://www.example.net");
        expect(testError.method).toBe("post");

        testError = new HTTPStatusError(-1);
        expect(testError.code).toBe(-1);
        expect(testError.url).toBe(null);
        expect(testError.method).toBe("get");
    });
})