import { TransactionRoutes } from "@/domains/transaction/routing";

import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have transaction routes", () => {
		for (const route of TransactionRoutes) {
			expect(Object.values(ProfilePaths)).toContain(route.path);
		}
	});

	it.each(TransactionRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
