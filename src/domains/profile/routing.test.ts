import { ProfileRoutes } from "@/domains/profile/routing";
import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have profile routes", () => {
		expect(ProfileRoutes).toStrictEqual([
			expect.objectContaining({ path: ProfilePaths.CreateProfile }),
			expect.objectContaining({ path: ProfilePaths.ImportProfile }),
			expect.objectContaining({ path: ProfilePaths.Welcome }),
		]);
	});

	it.each(ProfileRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
