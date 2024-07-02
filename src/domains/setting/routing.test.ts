import { SettingRoutes } from "@/domains/setting/routing";
import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have setting routes", () => {
		expect(SettingRoutes).toStrictEqual([
			expect.objectContaining({ path: ProfilePaths.GeneralSettings }),
			expect.objectContaining({ path: ProfilePaths.PasswordSettings }),
			expect.objectContaining({ path: ProfilePaths.ExportSettings }),
			expect.objectContaining({ path: ProfilePaths.AppearanceSettings }),
			expect.objectContaining({ path: ProfilePaths.Settings }),
			expect.objectContaining({ path: ProfilePaths.ServerManagmentSettings }),
			expect.objectContaining({ path: ProfilePaths.NetworkManagmentSettings }),
		]);
	});

	it.each(SettingRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
