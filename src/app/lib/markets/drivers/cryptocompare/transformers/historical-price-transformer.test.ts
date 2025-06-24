import { describe, it, expect } from "vitest";
import { HistoricalPriceTransformer } from "./historical-price-transformer";

const fixture = [
	{ close: 1.05, time: 1_616_025_600 },
	{ close: 1.15, time: 1_616_112_000 },
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
