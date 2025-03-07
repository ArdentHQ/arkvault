import { describe } from "@ardenthq/sdk-test";

import { parseUnits } from "./parse-units";

describe("parseUnits", async ({ assert, it }) => {
	it("should parse the value to wei", () => {
		assert.equal(parseUnits(1, "wei").valueOf(), "1");
	});

	it("should parse the value to gwei", () => {
		assert.equal(parseUnits(1, "gwei").valueOf(), "1000000000");
	});

	it("should parse the value to ark", () => {
		assert.equal(parseUnits(1, "ark").valueOf(), "1000000000000000000");
	});

	it("should throw an error for unsupported units", () => {
		assert.throws(
			() => parseUnits(1, "btc"),
			"Unsupported unit: btc. Supported units are 'wei', 'gwei', and 'ark'.",
		);
	});
});
