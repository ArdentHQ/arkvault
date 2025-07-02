import { describe, it, expect, beforeEach, vi } from "vitest";
import { env } from "@/utils/testing-library";
import { shouldUseDarkColors, shouldUseDimColors } from "./theme";

describe("shouldUseDarkColors", () => {
	beforeEach(() => {
		env.reset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns true if the html element has the dark class", () => {
		vi.spyOn(document, "querySelector").mockReturnValue({
			classList: {
				contains: () => true,
			},
		} as any);

		expect(shouldUseDarkColors()).toBe(true);
	});

	it("returns false if the html element does not have the dark class", () => {
		vi.spyOn(document, "querySelector").mockReturnValue({
			classList: {
				contains: () => false,
			},
		} as any);

		expect(shouldUseDarkColors()).toBe(false);
	});
});

describe("shouldUseDimColors", () => {
	beforeEach(() => {
		env.reset();
	});

	it("returns true if the html element has the dim class", () => {
		vi.spyOn(document, "querySelector").mockReturnValue({
			classList: {
				contains: () => true,
			},
		} as any);

		expect(shouldUseDimColors()).toBe(true);
	});

	it("returns false if the html element does not have the dim class", () => {
		vi.spyOn(document, "querySelector").mockReturnValue({
			classList: {
				contains: () => false,
			},
		} as any);

		expect(shouldUseDimColors()).toBe(false);
	});
});
