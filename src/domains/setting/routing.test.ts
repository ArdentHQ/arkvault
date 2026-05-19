import { SettingRoutes } from "@/domains/setting/routing";

import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have setting routes", () => {
		expect(SettingRoutes).toStrictEqual([
			expect.objectContaining({ path: ProfilePaths.GeneralSettings }),
			expect.objectContaining({ path: ProfilePaths.PasswordSettings }),
			expect.objectContaining({ path: ProfilePaths.ExportSettings }),
			expect.objectContaining({ path: ProfilePaths.Settings }),
			expect.objectContaining({ path: ProfilePaths.ServerManagmentSettings }),
		]);
	});

	it.each(SettingRoutes)("should use lazy loading with preload", async (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		await expect(route.component["preload"]()).resolves.not.toThrow();
	});
});
