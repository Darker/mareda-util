import ResolvablePromise from "../../../promises/ResolvablePromise.js";
import mockInstanceMethod from "../../helpers/mockFunctions.js";

describe("ResolvablePromise test", ()=>{
    it("resolves when resolve is called", async ()=>{
        const result = "test";
        /** @type {ResolvablePromise<typeof result>} **/
        const promise = new ResolvablePromise();

        expect(promise.fulfilled).toBe(false);
        setTimeout(()=>promise.resolve(result), 1);
        expect(promise.fulfilled).toBe(false);
        await expectAsync(promise.get()).toBeResolvedTo(result);
        expect(promise.fulfilled).toBe(true);
        expect(()=>promise.resolve(result)).toThrowError("Promise already fulfilled, cannot resolve");
    });
    it("does not call reject if not awaited whend destroyed", async ()=>{

        /** @type {ResolvablePromise} **/
        const promise = new ResolvablePromise();

        const mockReject = mockInstanceMethod(promise, "_reject");
        mockReject.noop = true;

        expect(promise.fulfilled).toBe(false);
        promise.destroy(new Error("test error"));
        expect(mockReject.callCount).toBe(0);
        expect(promise.fulfilled).toBe(true);
        expect(promise.rejected).toBe(true);
    });
    it("rejects on destroy if awaited", async ()=>{
        /** @type {ResolvablePromise} **/
        const promise = new ResolvablePromise();

        const getPromise = promise.get();
        const mockReject = mockInstanceMethod(promise, "_reject");
        mockReject.noop = true;
        promise.destroy(new Error("destroy error"));
        expect(mockReject.callCount).toBe(1);
        expect(promise.rejected).toBe(true);
    });
});