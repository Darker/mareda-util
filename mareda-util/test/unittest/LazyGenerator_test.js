import LazyGenerator from "../../iterators/LazyGenerator.js";


describe("LazyGenerator test", ()=>{
    it("Maps a generator", ()=>{
        const gen = new LazyGenerator([1, 2, 3][Symbol.iterator]());
        const final = gen.map(x=>x+"_");
        const results = [];
        for(const item of final) {
            results.push(item);
        }
        expect(results.length).toBe(3);
        expect(results).toEqual(["1_", "2_", "3_"]);
    });
    it("filters and maps", ()=>{
        const arrayIterator = [1,2,3][Symbol.iterator]();
        const gen = new LazyGenerator(arrayIterator);
        const final = gen.filter(x=>x%2!=0).map(x=>10*x);
        const results = [...gen];

        expect(results.length).toBe(2);
        expect(results).toEqual([10,30]);
    });
    it("zips items with equal lengths", ()=>{
        const src1 = [1,2,3];
        const src2 = [10, 20, 30];
        const gen = LazyGenerator.create(src1).zip(src2).map(x=>(x.first+x.second));
        const results = [...gen];
        expect(results).toEqual([11,22,33]);
    });
    it("zip produces null for missing items in first src", ()=>{
        const src1 = [1,2,3];
        const src2 = [10, 20, 30, 40];
        const gen = LazyGenerator.create(src1).zip(src2, false).map(x=>([x.first,x.second]));
        const results = [...gen];
        expect(results).toEqual([[1,10], [2, 20], [3, 30], [null, 40]]);
    });
    it("zip produces null for missing items in second src", ()=>{
        const src1 = [1,2,3,4];
        const src2 = [10, 20, 30];
        const gen = LazyGenerator.create(src1).zip(src2, false).map(x=>([x.first,x.second]));
        const results = [...gen];
        expect(results).toEqual([[1,10], [2, 20], [3, 30], [4, null]]);
    });
    it("zip fails when both must exist", ()=>{
        const src1 = [1,2,3,4];
        const src2 = [10, 20, 30];
        const gen = LazyGenerator.create(src1).zip(src2, true).map(x=>([x.first,x.second]));

        expect(()=>[...gen]).toThrow(new RangeError("GeneratorZipStep did not obtain a value from both sources but was required to."));
        const gen2 = LazyGenerator.create(src2).zip(src1, true).map(x=>([x.first,x.second]));
        expect(()=>[...gen2]).toThrow(new RangeError("GeneratorZipStep did not obtain a value from both sources but was required to."));
    });
    it("restarts arrays", ()=>{
        const src1 = [1,2,3];
        const gen = LazyGenerator.create(src1).map(x=>(2*x));
        const results = [...gen];
        expect(results).toEqual([2,4,6]);
        expect([...gen]).toEqual([2,4,6]);
    });
    it("throws on invalid restart", ()=>{
        function * getItems() {
            yield 1;
            yield 2;
            yield 3;
        }
        
        const gen = LazyGenerator.create(getItems()).map(x=>(2*x));
        expect(gen.lastStep.restartable).toBe(false);
        expect(gen.lastStep.indexable).toBe(false);
        
        const results = [...gen];
        expect(results).toEqual([2,4,6]);
        expect(()=>[...gen]).toThrow(new Error("This LazyGenerator cannot be restarted - one of the sources is a non-restartable source."));
    });
    it("flattens arrays", ()=>{
        const gen = LazyGenerator.create([[1,2], [3,4]]).flat();
        expect(gen.lastStep.restartable).toBe(true);
        expect(gen.lastStep.indexable).toBe(false);
        
        const results = [...gen];
        expect(results).toEqual([1,2,3,4]);
        expect([...gen]).toEqual([1,2,3,4]);
    });
});