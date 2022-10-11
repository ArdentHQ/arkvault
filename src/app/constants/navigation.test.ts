/* eslint-disable jest/require-hook */
/* eslint-disable @typescript-eslint/require-await */
import { getUserMenuActions } from "./navigation";
import { getDefaultProfileId } from "@/utils/testing-library";

describe("Navigation Menu", () => {
	let menuItems = [];

	beforeAll(() => {
		menuItems = getUserMenuActions(jest.fn());
	});

	it("should get contacts path", async () => {
		expect(menuItems[0].mountPath(getDefaultProfileId())).toBe(`/profiles/${getDefaultProfileId()}/contacts`);
	});

	it("should get votes path", async () => {
		expect(menuItems[1].mountPath(getDefaultProfileId())).toBe(`/profiles/${getDefaultProfileId()}/votes`);
	});

	it("should get settings path", async () => {
		expect(menuItems[2].mountPath(getDefaultProfileId())).toBe(`/profiles/${getDefaultProfileId()}/settings`);
	});

	it("should get documentation url", async () => {
		expect(menuItems[3].mountPath(getDefaultProfileId())).toBe("https://arkvault.io/docs");
	});

	it("should get support path", async () => {
		expect(menuItems[4].mountPath(getDefaultProfileId())).toBe("/");
	});

	it("should get signout path", async () => {
		expect(menuItems[5].mountPath(getDefaultProfileId())).toBe("/");
	});
});
