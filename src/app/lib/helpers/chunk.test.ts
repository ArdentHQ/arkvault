import { chunk } from "./chunk";

describe("chunk", () => {
	it("should chunk the given array", () => {
		expect(chunk(["a", "b", "c", "d"], 2)).toEqual([
			["a", "b"],
			["c", "d"],
		]);
		expect(chunk(["a", "b", "c", "d"], 3)).toEqual([["a", "b", "c"], ["d"]]);
	});

	it("should not chunk if 0 is passed in", () => {
		expect(chunk(["a", "b", "c", "d"], 0)).toEqual([]);
	});

	it("should not chunk if a negative number is passed in", () => {
		expect(chunk(["a", "b", "c", "d"], -1)).toEqual([]);
	});
});
