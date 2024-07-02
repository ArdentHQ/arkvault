import { ProfilePaths } from "@/router/paths";

import { ContactRoutes } from "./routing";

describe("routing", () => {
	it("should have contact routes", () => {
		expect(ContactRoutes).toStrictEqual([expect.objectContaining({ path: ProfilePaths.Contacts })]);
	});

	it.each(ContactRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
