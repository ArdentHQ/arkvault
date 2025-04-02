import { cloneArray } from "./clone-array";

describe("cloneArray", () => {
	it("should work like lodash", () => {
		const objects = [{ a: 1 }, { b: 2 }];

		expect(cloneArray(objects)).toEqual(objects);
	});
});
