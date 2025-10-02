import { ExchangeRoutes } from "@/domains/exchange/routing";

import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have exchange routes", () => {
		expect(ExchangeRoutes).toStrictEqual([expect.objectContaining({ path: ProfilePaths.Exchange })]);
	});

	it.each(ExchangeRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
