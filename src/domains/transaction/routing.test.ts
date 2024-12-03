import { TransactionRoutes } from "@/domains/transaction/routing";

import { ProfilePaths } from "@/router/paths";

describe("routing", () => {
	it("should have transaction routes", () => {
		expect(TransactionRoutes).toStrictEqual([
			expect.objectContaining({ path: ProfilePaths.SendRegistration }),
			expect.objectContaining({ path: ProfilePaths.SendValidatorResignation }),
			expect.objectContaining({ path: ProfilePaths.SendTransferWallet }),
			expect.objectContaining({ path: ProfilePaths.SendTransfer }),
			expect.objectContaining({ path: ProfilePaths.SendVoteWallet }),
			expect.objectContaining({ path: ProfilePaths.SendVote }),
		]);
	});

	it.each(TransactionRoutes)("should use lazy loading with preload", (route) => {
		expect(typeof route.component["preload"]).toBe("function");
		expect(() => route.component["preload"]()).not.toThrow();
	});
});
