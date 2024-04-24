import { randomWordPositions } from "./randomWordPositions";

describe("randomWordPositions", () => {
	it("should return an array of three unique numbers", () => {
		const length = 10;
		const results = randomWordPositions(length);
		expect(results).toHaveLength(3);
		expect(new Set(results).size).toBe(3); // Check uniqueness
	});

	it("should return numbers within the correct range", () => {
		const length = 5;
		const results = randomWordPositions(length);
		for (const number_ of results) {
			expect(number_).toBeGreaterThanOrEqual(1);
			expect(number_).toBeLessThanOrEqual(length);
		}
	});

	it("should always return the numbers sorted in ascending order", () => {
		const length = 8;
		const results = randomWordPositions(length);
		const sortedResults = [...results].sort((a, b) => a - b);
		expect(results).toEqual(sortedResults);
	});
});
