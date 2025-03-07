import { describe } from "@ardenthq/sdk-test";

import { formatUnits } from "./format-units";

describe("formatUnits", async ({ assert, it }) => {
	it("should format the value to wei", () => {
		assert.equal(formatUnits("1", "wei").valueOf(), "1");
	});

	it("should format the value to gwei", () => {
		assert.equal(formatUnits("1000000000", "gwei").valueOf(), "1");
	});

	it("should format the value to ark", () => {
		assert.equal(formatUnits("1000000000000000000", "ark").valueOf(), "1");
	});

	it("should throw an error for unsupported units", () => {
		assert.throws(
			() => formatUnits("1", "btc"),
			"Unsupported unit: btc. Supported units are 'wei', 'gwei', and 'ark'.",
		);
	});
});
