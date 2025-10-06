import { describe, it, expect } from "vitest";
import { getUrlParameter } from "./paths";

describe("paths", () => {
	it("returns the segment at the given index", () => {
		expect(getUrlParameter("/profiles/123/wallets/456", 0)).toBe("profiles");
		expect(getUrlParameter("/profiles/123/wallets/456", 1)).toBe("123");
		expect(getUrlParameter("/profiles/123/wallets/456", 2)).toBe("wallets");
		expect(getUrlParameter("/profiles/123/wallets/456", 3)).toBe("456");
	});

	it("ignores leading, trailing and repeated slashes", () => {
		expect(getUrlParameter("profiles///123//", 0)).toBe("profiles");
		expect(getUrlParameter("profiles///123//", 1)).toBe("123");
	});

	it("throws when index is out of bounds", () => {
		expect(() => getUrlParameter("/profiles/123", 2)).toThrow(
			'Parameter at index 2 doesn\'t exist in "/profiles/123".',
		);
	});

	it("supports negative indices by returning from the end", () => {
		expect(getUrlParameter("/profiles/123", -1)).toBe("123");
	});
});
