import { describe, it, expect } from "vitest";
import { browser } from "./platform";

describe("browser", () => {
	it("supports overflow overlay", () => {
		expect(browser.supportsOverflowOverlay()).toBe(true);
	});

	it("does not support overflow overlay", () => {
		vi.spyOn(CSS, "supports").mockReturnValue(false);

		expect(browser.supportsOverflowOverlay()).toBe(false);
	});
});
