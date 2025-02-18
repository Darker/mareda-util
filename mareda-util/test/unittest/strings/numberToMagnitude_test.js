import isNonEmptyString from "../../../strings/isNonEmptyString.js";
import numberToMagnitude from "../../../strings/numberToMagnitude.js";
import removeAccents from "../../../strings/removeAccents.js";

describe("numberToMagnitude test", ()=>{
    it("number test", ()=>{
        expect(numberToMagnitude(0)).toEqual({num: 0, suffix: ""});
        expect(numberToMagnitude(10)).toEqual({num: 10, suffix: ""});
        expect(numberToMagnitude(1500)).toEqual({num: 1.5, suffix: "k"});
        expect(numberToMagnitude(1000000)).toEqual({num: 1, suffix: "M"});
        expect(numberToMagnitude(5000000)).toEqual({num: 5, suffix: "M"});
        expect(numberToMagnitude(0.1)).toEqual({num: 100, suffix: "m"});
        expect(numberToMagnitude(0.0005, {useUnicode: false})).toEqual({num: 500, suffix: "u"});
        expect(numberToMagnitude(1.5)).toEqual({num: 1.5, suffix: ""});
        expect(numberToMagnitude(1500.5)).toEqual({num: 1.5005, suffix: "k"});
        
    });
    it("bigint test", ()=>{
        expect(numberToMagnitude(10n)).toEqual({num: 10, suffix: ""});
        expect(numberToMagnitude(1500n)).toEqual({num: 1.5, suffix: "k"});
        expect(numberToMagnitude(1000000n)).toEqual({num: 1, suffix: "M"});
        expect(numberToMagnitude(5000000n)).toEqual({num: 5, suffix: "M"});
        
        expect(numberToMagnitude(1500n, {bigintMath: true})).toEqual({num: 1, suffix: "k"});
    });
});