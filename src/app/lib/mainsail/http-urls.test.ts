import { describe, it, expect } from "vitest";
import { ensureTrailingSlash } from "./http-urls";

describe("ensureTrailingSlash", () => {
	it("should add trailing slash if missing", () => {
		expect(ensureTrailingSlash("https://example.com")).toBe("https://example.com/");
	});

	it("should not add trailing slash if already present", () => {
		expect(ensureTrailingSlash("https://example.com/")).toBe("https://example.com/");
	});
});
