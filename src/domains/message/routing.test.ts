import { MessageRoutes } from "@/domains/message/routing";
import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have wallet routes", () => {
		expect(MessageRoutes).toStrictEqual([
			expect.objectContaining({ path: ProfilePaths.SignMessage }),
			expect.objectContaining({ path: ProfilePaths.SignMessageWallet }),
			expect.objectContaining({ path: ProfilePaths.VerifyMessage }),
			expect.objectContaining({ path: ProfilePaths.VerifyMessageWallet }),
		]);
	});

	it.each(MessageRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
