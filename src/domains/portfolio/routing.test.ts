import { PortfolioRoutes } from "./routing";
import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have portfolio routes", () => {
		expect(PortfolioRoutes).toStrictEqual([expect.objectContaining({ path: ProfilePaths.Dashboard })]);
	});

	it.each(PortfolioRoutes)("should use lazy loading with preload", async (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		await expect(route.component["preload"]()).resolves.not.toThrow();
	});
});
