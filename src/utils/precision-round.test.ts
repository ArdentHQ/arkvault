import { precisionRound } from "./precision-round";

describe("Precision round", () => {
	it.each([
		[9.892_000_000_000_001, 8, 9.892],
		[9.892_000_000_000_001, 3, 9.892],
		[9.892_000_000_000_001, 2, 9.89],
		[9.892_000_000_000_001, 15, 9.892_000_000_000_001],
		[1, 10, 1],
	])("rounds a number according to precision", async (number, precision, result) => {
		expect(precisionRound(number, precision)).toBe(result);
	});
});
