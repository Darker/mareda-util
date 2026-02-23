import splitBinaryString from "../../../iterators/splitBinaryString.js";
import iterableUintArray from "../../helpers/iterableUintArray.js";

const myEncoder = new TextEncoder();



describe("splitBinaryString test", ()=>{
    it("splits newlines", async()=>{
        const strData = [];
        for(let i=0; i<12; ++i) {
            strData.push(("dsa" + i.toString() + "hx").repeat(Math.floor(31+Math.random()*60)))
        }
        let str = "";
        for(const item of strData) {
            if(str.length > 0)
                str += Math.random() > 0.5 ? "\r\n" : "\n";
            str += item;
            // if(Math.random() > 0.8) {
            //     str += "\n";
            // }
        }

        const bytes = myEncoder.encode(str);
        let lineIdx = 0;
        for await(const line of splitBinaryString(iterableUintArray(bytes))) {
            expect(lineIdx).toBeLessThan(strData.length);
            expect(line).toEqual(strData[lineIdx]);
            ++lineIdx;
        }
    });
    it("handles empty outputs correctly (small chunks)", async() => {
        const str = "______aaaaaaaaaaaaaaaaaa_aaaaaaaaaa_aaaaaaaaa_aaaaaa____";
        const bytes = myEncoder.encode(str);
        const split = str.split("_");

        let lineIdx = 0;
        for await(const line of splitBinaryString(iterableUintArray(bytes, {chunkBase:8, chunkRandom:4}), "_")) {
            expect(lineIdx).toBeLessThan(split.length);
            expect(line).toEqual(split[lineIdx]);
            ++lineIdx;
        }
        expect(lineIdx).toEqual(split.length);
    });
    it("handles empty outputs correctly (large chunks)", async() => {
        const str = "______aaaaaaaaaaaaaaaaaa_aaaaaaaaaa_aaaaaaaaa_aaaaaa____";
        const bytes = myEncoder.encode(str);
        const split = str.split("_");

        let lineIdx = 0;
        for await(const line of splitBinaryString(iterableUintArray(bytes, {chunkBase:1000, chunkRandom:0}), "_")) {
            expect(lineIdx).toBeLessThan(split.length);
            expect(line).toEqual(split[lineIdx]);
            ++lineIdx;
        }
        expect(lineIdx).toEqual(split.length);
    });
    it("handles single item correctly (small chunks)", async() => {
        const str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const bytes = myEncoder.encode(str);
        const split = str.split("_");

        let lineIdx = 0;
        for await(const line of splitBinaryString(iterableUintArray(bytes, {chunkBase:8, chunkRandom:4}), "_")) {
            expect(lineIdx).toBeLessThan(split.length);
            expect(line).toEqual(split[lineIdx]);
            ++lineIdx;
        }
        expect(lineIdx).toEqual(split.length);
    });
    it("handles single item correctly (large chunks)", async() => {
        const str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const bytes = myEncoder.encode(str);
        const split = str.split("_");

        let lineIdx = 0;
        for await(const line of splitBinaryString(iterableUintArray(bytes, {chunkBase:1000, chunkRandom:4}), "_")) {
            expect(lineIdx).toBeLessThan(split.length);
            expect(line).toEqual(split[lineIdx]);
            ++lineIdx;
        }
        expect(lineIdx).toEqual(split.length);
    });
});