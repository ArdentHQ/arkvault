import { NewsRoutes } from "@/domains/news/routing";

import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have news routes", () => {
		expect(NewsRoutes).toStrictEqual([expect.objectContaining({ path: ProfilePaths.News })]);
	});

	it.each(NewsRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
