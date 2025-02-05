import isNonEmptyString from "../../../strings/isNotEmptyString.js";
import removeAccents from "../../../strings/removeAccents.js";

describe("simpleHelpers test", ()=>{
    it("removes accents", ()=>{
        // use console log to see, but I didn't want to have unicode in my test file
        const str = "\u017e\u0159\u010d\u00fd\u00fd\u00e1\u017e\u0159\u011b\u00fa\u016f";
        const expected = "zrcyyazreuu";
        expect(removeAccents(str)).toBe(expected);
    });
    it("never throws when checking for non empty string", ()=>{
        expect(isNonEmptyString("")).toBeFalse();
        expect(isNonEmptyString()).toBeFalse();
        expect(isNonEmptyString(null)).toBeFalse();
        expect(isNonEmptyString(new String("test"))).toBeTrue();
        expect(isNonEmptyString({toString:()=>{throw new Error("b")}})).toBeFalse();
        expect(isNonEmptyString({length: 5})).toBeFalse();
    });
});