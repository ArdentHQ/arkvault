import { describe, it, expect, beforeEach } from "vitest";
import { env } from "@/utils/testing-library";
import { shouldUseDarkColors } from "./theme";

describe("shouldUseDarkColors", () => {
	beforeEach(() => {
		env.reset();
	});

	it("returns true if the html element has the dark class", () => {
		document.querySelector("html")?.classList.add("dark");

		expect(shouldUseDarkColors()).toBe(true);
	});

	it("returns false if the html element does not have the dark class", () => {
		document.querySelector("html")?.classList.remove("dark");

		expect(shouldUseDarkColors()).toBe(false);
	});
});
