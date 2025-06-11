import { describe, it, expect } from "vitest";
import { HistoricalPriceTransformer } from "./historical-price-transformer";

const fixture = [
	{ time: 1616025600, close: 1.05 },
	{ time: 1616112000, close: 1.15 },
];

describe("HistoricalPriceTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new HistoricalPriceTransformer(fixture);
		const result = transformer.transform({ dateFormat: "YYYY-MM-DD" });

		expect(result.labels).toHaveLength(2);
		expect(result.datasets).toHaveLength(2);
		expect(result.min).toBe(1.05);
		expect(result.max).toBe(1.15);
	});
});
