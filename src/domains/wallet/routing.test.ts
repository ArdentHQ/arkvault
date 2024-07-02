import { WalletRoutes } from "@/domains/wallet/routing";
import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have wallet routes", () => {
		expect(WalletRoutes).toStrictEqual([
			expect.objectContaining({ path: ProfilePaths.CreateWallet }),
			expect.objectContaining({ path: ProfilePaths.ImportWalletLedger }),
			expect.objectContaining({ path: ProfilePaths.ImportWallet }),
			expect.objectContaining({ path: ProfilePaths.WalletDetails }),
			expect.objectContaining({ path: ProfilePaths.WalletGroupPage }),
		]);
	});

	it.each(WalletRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
