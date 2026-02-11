import getFieldInherited from "../../../typing/getFieldInherited.js";

class TestBaseClass {
    constructor() {
        this.simpleField = "test";
    }

    getSimpleField() {
        return this.simpleField;
    }
}

class TestDerivedClass extends TestBaseClass {
    constructor() {
        super();
        this.numval = 24;
    }

    getNumval() {
        return this.numval;
    }
}

describe("getFieldInherited test", ()=>{
    it("gets non-inherited field type correct", ()=>{
        expect(getFieldInherited(TestBaseClass, "getSimpleField")).toBe(TestBaseClass.prototype.getSimpleField);
        expect(getFieldInherited(TestBaseClass, "getSimpleField", "boolean")).toBeUndefined();
        expect(getFieldInherited(TestBaseClass, "getSimpleField", "function")).toBe(TestBaseClass.prototype.getSimpleField);
    });
    it("gets inherited field type correct", ()=>{

        expect(getFieldInherited(TestDerivedClass, "getSimpleField")).toBe(TestBaseClass.prototype.getSimpleField);
        expect(getFieldInherited(TestDerivedClass, "getSimpleField", "boolean")).toBeUndefined();
        expect(getFieldInherited(TestDerivedClass, "getSimpleField", "function")).toBe(TestBaseClass.prototype.getSimpleField);

        expect(getFieldInherited(TestDerivedClass, "getNumval")).toBe(TestDerivedClass.prototype.getNumval);
        expect(getFieldInherited(TestDerivedClass, "getNumval", "boolean")).toBeUndefined();
        expect(getFieldInherited(TestDerivedClass, "getNumval", "function")).toBe(TestDerivedClass.prototype.getNumval);
    });
});