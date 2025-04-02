import { describe, expect, it } from "vitest";

import { words } from "./words";

describe("words", () => {
	it("should work with words", () => {
		expect(words("fred, barney, & pebbles")).toEqual(["fred", "barney", "pebbles"]);
	});
});
