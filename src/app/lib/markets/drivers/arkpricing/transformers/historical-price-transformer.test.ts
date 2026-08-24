import { describe, it, expect } from "vitest";
import { HistoricalPriceTransformer } from "./historical-price-transformer";

const fixture = [
	{ close: 0.401, date: "2024-01-13", volume: 1_100_000 },
	{ close: 0.412, date: "2024-01-14", volume: 1_230_000 },
];

describe("HistoricalPriceTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new HistoricalPriceTransformer(fixture);
		const result = transformer.transform({ dateFormat: "YYYY-MM-DD" });

		expect(result.labels).toHaveLength(2);
		expect(result.datasets).toHaveLength(2);
		expect(result.min).toBe(0.401);
		expect(result.max).toBe(0.412);
	});
});
