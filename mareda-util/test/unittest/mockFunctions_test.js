import mockInstanceMethod from "../helpers/mockFunctions.js";

class MockTestClass {
    constructor() {
        this.value = 0;
    }
    getValue() {
        return this.value;
    }
    /**
     * 
     * @param {number} x 
     */
    setValue(x) {
        this.value = x;
    }
}

describe("mockFunctions test", ()=>{
    it("mocks a simple function", ()=>{
        const test = new MockTestClass();
        const mockSet = mockInstanceMethod(test, "setValue");
        mockSet.overrideFn = function(params, mock, orig, target) {
            params[0] = params[0] + 2;
            orig.apply(target, params);
        };
        test.setValue(2);
        expect(test.getValue()).toBe(4);
        expect(mockSet.callCount).toBe(1);
    });
});