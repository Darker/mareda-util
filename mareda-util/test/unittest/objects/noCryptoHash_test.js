
import noCryptoObjectHash from "../../../objects/noCryptoObjectHash.js";


/**
 * This wraps the expects for bigint, because jasmine cannot serialize it
 * when passing it to the test runner
 * @param {any} a 
 * @param {any} b 
 * @param {object} param1
 * @param {boolean} [param1.invert] assert fail if hashes DO match
 * @param {number} [param1.maxIterations] passed to the hasher
 */
function expectHashEquals(a, b, {invert = false, maxIterations = 1000}={}) {
    const aHash = noCryptoObjectHash(a, {maxIterations});
    const bHash = noCryptoObjectHash(b, {maxIterations});
    if(aHash == bHash && invert) {
        expect(aHash.toString()).not.toBe(bHash.toString());
    }
    else if(aHash != bHash && !invert) {
        expect(aHash.toString()).toBe(bHash.toString());
    }
}


describe("noCryptoObjectHash_test", ()=>{
    it("hashes simple objects", ()=>{
        expectHashEquals({a: 22, b: null, c: "hello"}, {b: null, a: 22, c: "hello"});
        const date = new Date();
        const date2 = new Date(date.getTime());
        expectHashEquals({a: 22, b: date, c: "hello"}, {c: "hello", b: date2, a: 22});
        expectHashEquals(date, date2);
        expectHashEquals("test", "test");
        expectHashEquals(0.23654, 0.23654);
        expectHashEquals(/[a-z]bla/i, new RegExp("[a-z]bla", "i"));
        expectHashEquals(9999999999999999999999999999999n, 9999999999999999999999999999999n);
        expectHashEquals(9999999999999999999999999999999n, 9999999999999999999999999999998n, {invert: true});
    });
    it("small difference in big objects means different hash", ()=>{
        const baselineArray = [];
        const innerCount = 1000;
        const outerCount = 500;
        for(let i = 0; i < innerCount; i++) {
            baselineArray.push(i);
        }

        const maxIterations = innerCount*1000+1000+1;

        const array1 = [];
        const array2 = [];
        for(let i = 0; i < outerCount; i++) {
            if(i<3 || i > outerCount-4) {
                array1.push([...baselineArray]);
                array2.push([...baselineArray]);
            }
            else {
                array1.push(baselineArray);
                array2.push(baselineArray); 
            }
        }

        expectHashEquals(array1, array2, {maxIterations});
        array1[0][0] = array1[0][0] + 1;
        expectHashEquals(array1, array2, {invert: true, maxIterations});
        array2[0][0] = array2[0][0] + 1;

        expectHashEquals(array1, array2, {maxIterations});

        // also test with last keys for both arrays
        array1[outerCount-1][innerCount-1] = 14;
        array2[outerCount-1][innerCount-1] = 0;
        expect(array1[outerCount-1][innerCount-1]).not.toBe(array2[outerCount-1][innerCount-1]);
        expectHashEquals(array1, array2, {invert: true, maxIterations});
        array2[outerCount-1][innerCount-1] = 14;
        expectHashEquals(array1, array2, {maxIterations});
    });
    it("referrences hashed as plain objs", ()=>{
        const copied = {a: {d:4}};
        const a = {
            x: copied,
            y: {a: {d:4}},
            z: 15,
            w: {a: {d:4}},
        };
        const b = {
            w: {a: {d:4}},
            x: {a: {d:4}},
            y: copied,
            z: 15
        };
        expectHashEquals(a, b);
        copied.a.d = 5;
        expectHashEquals(a, b, {invert: true});
    });
    it("distinguishes number and bigint", ()=>{
        expectHashEquals(0, 0n, {invert: true});
    });

});