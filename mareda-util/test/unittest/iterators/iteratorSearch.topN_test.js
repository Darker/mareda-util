import { iteratorSearch } from "../../../iterators/iteratorSearch.js";

describe("topN", () => {

    // A tiny mock dataset
    const items = [
        { id: "a", score: 0.9 },
        { id: "b", score: 0.1 },
        { id: "c", score: 0.5 },
        { id: "d", score: 0.2 },
        { id: "e", score: 0.7 }
    ];

    // scoring function: smaller = better
    /**
     * 
     * @param {typeof items[0]} item 
     */
    function valueFn(item) {
        return item.score;
    }

    it("returns the top N items sorted ascending by score", () => {
        const result = iteratorSearch.topN(items, valueFn, 3);

        expect(result.length).toBe(3);

        // Should be the three smallest scores: 0.1, 0.2, 0.5
        const scores = result.map(r => r.score);
        expect(scores).toEqual([0.1, 0.2, 0.5]);

        // Should preserve the correct items
        const ids = result.map(r => r.item.id);
        expect(ids).toEqual(["b", "d", "c"]);
    });

    it("returns fewer items if N > dataset size", () => {
        const result = iteratorSearch.topN(items, valueFn, 10);
        expect(result.length).toBe(items.length);

        const ids = result.map(r => r.item.id);
        expect(ids).toEqual(["b", "d", "c", "e", "a"]);
    });

    it("returns empty array when N = 0", () => {
        const result = iteratorSearch.topN(items, valueFn, 0);
        expect(result).toEqual([]);
    });

});
