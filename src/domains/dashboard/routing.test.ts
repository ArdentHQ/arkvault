import { DashboardRoutes } from "@/domains/dashboard/routing";

import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have dashboard routes", () => {
		expect(DashboardRoutes).toStrictEqual([expect.objectContaining({ path: ProfilePaths.Dashboard })]);
	});

	it.each(DashboardRoutes)("should use lazy loading with preload", async (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		await expect(route.component["preload"]()).resolves.not.toThrow();
	});
});
