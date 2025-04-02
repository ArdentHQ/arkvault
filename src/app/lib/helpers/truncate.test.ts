import { describe } from "@ardenthq/sdk-test";

import { truncate } from "./truncate";

describe("truncate", async ({ assert, it, nock, loader }) => {
	it("should truncate strings if they are above the specified length", () => {
		assert.is(truncate("Hello World"), "Hello World");

		assert.is(
			truncate("Hello World", {
				length: 5,
			}),
			"He...",
		);

		assert.is(
			truncate("Hello World", {
				length: 8,
				omission: " [...]",
			}),
			"He [...]",
		);

		assert.is(
			truncate("#".repeat(10), {
				length: 5,
				omissionPosition: "left",
			}),
			`...${"#".repeat(2)}`,
		);

		assert.is(
			truncate("#".repeat(10), {
				length: 5,
				omissionPosition: "right",
			}),
			`${"#".repeat(2)}...`,
		);

		assert.is(
			truncate("#".repeat(15), {
				length: 5,
				omissionPosition: "middle",
			}),
			`${"#".repeat(1)}...${"#".repeat(1)}`,
		);

		assert.is(truncate("#".repeat(30), {}), `${"#".repeat(27)}...`);
	});
});
