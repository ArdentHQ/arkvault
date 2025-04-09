import { describe, it, expect } from "vitest";
import { formatUnits } from "./format-units";

describe("formatUnits", () => {
	it("should format the value to wei", () => {
		expect(formatUnits("1", "wei").valueOf()).toBe("1");
	});

	it("should format the value to gwei", () => {
		expect(formatUnits("1000000000", "gwei").valueOf()).toBe("1");
	});

	it("should format the value to ark", () => {
		expect(formatUnits("1000000000000000000", "ark").valueOf()).toBe("1");
	});

	it("should throw an error for unsupported units", () => {
		expect(() => formatUnits("1", "btc")).toThrow(
			"Unsupported unit: btc. Supported units are 'wei', 'gwei', and 'ark'."
		);
	});
});
