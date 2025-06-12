import { describe, it, expect } from "vitest";
import { HistoricalVolumeTransformer } from "./historical-volume-transformer";

const fixture = {
	total_volumes: Array.from({ length: 50 }, (_, index) => [index * 1000, index]),
};

describe("HistoricalVolumeTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new HistoricalVolumeTransformer(fixture);
		const result = transformer.transform({ dateFormat: "YYYY-MM-DD" });

		expect(result.labels).toHaveLength(3);
		expect(result.datasets).toHaveLength(3);
		expect(result.min).toBe(0);
		expect(result.max).toBe(48);
	});
});
