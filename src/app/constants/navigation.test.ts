/* eslint-disable @typescript-eslint/require-await */
import { getUserMenuActions } from "./navigation";
import { getMainsailProfileId } from "@/utils/testing-library";

describe("Navigation Menu", () => {
	let menuItems = [];

	const profileId = getMainsailProfileId();

	beforeAll(() => {
		menuItems = getUserMenuActions(vi.fn());
	});

	it("should get settings path", async () => {
		expect(menuItems[0]["options"][0].mountPath(profileId)).toBe(`/profiles/${profileId}/settings`);
	});

	it("should get documentation url", async () => {
		expect(menuItems[1]["options"][0].mountPath(profileId)).toBe("https://arkvault.io/docs");
	});

	it("should get signout path", async () => {
		expect(menuItems[1]["options"][1].mountPath(profileId)).toBe("/");
	});
});
