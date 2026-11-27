import { describe, it, expect } from "vitest";
import { HistoricalVolumeTransformer } from "./historical-volume-transformer";

const fixture = [
	{ close: 0.401, date: "2024-01-13", volume: 1_100_000 },
	{ close: 0.412, date: "2024-01-14", volume: 1_230_000 },
];

describe("HistoricalVolumeTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new HistoricalVolumeTransformer(fixture);
		const result = transformer.transform({ dateFormat: "YYYY-MM-DD" });

		expect(result.labels).toHaveLength(2);
		expect(result.datasets).toHaveLength(2);
		expect(result.min).toBe(1_100_000);
		expect(result.max).toBe(1_230_000);
	});
});
