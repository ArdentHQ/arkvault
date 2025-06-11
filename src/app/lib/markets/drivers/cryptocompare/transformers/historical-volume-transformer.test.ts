import { describe, it, expect } from "vitest";
import { HistoricalVolumeTransformer } from "./historical-volume-transformer";

const fixture = [
	{ time: 1616025600, volumeto: 1000 },
	{ time: 1616112000, volumeto: 2200 },
];

describe("HistoricalVolumeTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new HistoricalVolumeTransformer(fixture);
		const result = transformer.transform({ dateFormat: "YYYY-MM-DD" });

		expect(result.labels).toHaveLength(2);
		expect(result.datasets).toHaveLength(2);
		expect(result.min).toBe(1000);
		expect(result.max).toBe(2200);
	});
});
