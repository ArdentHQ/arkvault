/* eslint-disable @typescript-eslint/require-await */
import { getDefaultProfileId } from "@/utils/testing-library";

import { getUserMenuActions } from "./navigation";

describe("Navigation Menu", () => {
	let menuItems = [];

	beforeAll(() => {
		menuItems = getUserMenuActions(vi.fn());
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
