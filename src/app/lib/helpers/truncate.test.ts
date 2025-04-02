import { describe, expect, it } from "vitest";

import { truncate } from "./truncate";

describe("truncate", () => {
	it("should truncate strings if they are above the specified length", () => {
		expect(truncate("Hello World")).toBe("Hello World");

		expect(
			truncate("Hello World", {
				length: 5,
			}),
		).toBe("He...");

		expect(
			truncate("Hello World", {
				length: 8,
				omission: " [...]",
			}),
		).toBe("He [...]");

		expect(
			truncate("#".repeat(10), {
				length: 5,
				omissionPosition: "left",
			}),
		).toBe(`...${"#".repeat(2)}`);

		expect(
			truncate("#".repeat(10), {
				length: 5,
				omissionPosition: "right",
			}),
		).toBe(`${"#".repeat(2)}...`);

		expect(
			truncate("#".repeat(15), {
				length: 5,
				omissionPosition: "middle",
			}),
		).toBe(`${"#".repeat(1)}...${"#".repeat(1)}`);

		expect(truncate("#".repeat(30), {})).toBe(`${"#".repeat(27)}...`);
	});
});
