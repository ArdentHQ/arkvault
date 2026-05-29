import { VoteRoutes } from "@/domains/vote/routing";

import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have vote routes", () => {
		expect(VoteRoutes).toStrictEqual([
			expect.objectContaining({ path: ProfilePaths.Votes }),
			expect.objectContaining({ path: ProfilePaths.VotesWallet }),
		]);
	});

	it.each(VoteRoutes)("should use lazy loading with preload", async (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		await expect(route.component["preload"]()).resolves.not.toThrow();
	});
});
