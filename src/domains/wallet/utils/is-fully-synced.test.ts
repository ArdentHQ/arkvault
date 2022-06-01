import { Contracts } from "@payvo/sdk-profiles";

import { isFullySynced } from "@/domains/wallet/utils/is-fully-synced";
import { env, getDefaultProfileId } from "@/utils/testing-library";

describe("isFullySynced", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();
	});

	it("returns true when wallet was fully restored and synced", () => {
		jest.spyOn(wallet, "hasBeenFullyRestored").mockReturnValueOnce(true);
		jest.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValueOnce(true);

		expect(isFullySynced(wallet)).toBe(true);
	});

	it("returns true when wallet was fully restored and balance is 0", () => {
		jest.spyOn(wallet, "hasBeenFullyRestored").mockReturnValueOnce(true);
		jest.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValueOnce(false);
		jest.spyOn(wallet, "balance").mockReturnValueOnce(0);

		expect(isFullySynced(wallet)).toBe(true);
	});

	it("returns false when wallet was not fully restored", () => {
		jest.spyOn(wallet, "hasBeenFullyRestored").mockReturnValueOnce(false);

		expect(isFullySynced(wallet)).toBe(false);
	});
});
