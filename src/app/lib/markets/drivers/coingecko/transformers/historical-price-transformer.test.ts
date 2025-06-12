import { describe, it, expect } from "vitest";
import { HistoricalPriceTransformer } from "./historical-price-transformer";

const fixture = {
	prices: Array.from({ length: 50 }, (_, index) => [index * 1000, index]),
};

describe("HistoricalPriceTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new HistoricalPriceTransformer(fixture);
		const result = transformer.transform({ dateFormat: "YYYY-MM-DD" });

		expect(result.labels).toHaveLength(3);
		expect(result.datasets).toHaveLength(3);
		expect(result.min).toBe(0);
		expect(result.max).toBe(48);
	});
});
