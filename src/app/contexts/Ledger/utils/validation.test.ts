import { Contracts } from "@payvo/sdk-profiles";
import { hasRequiredAppVersion } from "./validation";

import { env, getDefaultProfileId, mockNanoXTransport } from "@/utils/testing-library";

describe("Persist App Validation", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let ledgerListenSpy: jest.SpyInstance;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
	});

	beforeEach(() => {
		ledgerListenSpy = mockNanoXTransport();
	});

	afterEach(() => {
		ledgerListenSpy.mockRestore();
	});

	it("should have minimum required app version", async () => {
		const versionSpy = jest.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.3.0");

		await expect(hasRequiredAppVersion(wallet.coin())).resolves.toBe(true);

		versionSpy.mockRestore();
	});

	it("should not have minimum required app version", async () => {
		const versionSpy = jest.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("1.3.0");

		await expect(hasRequiredAppVersion(wallet.coin())).resolves.toBe(false);

		versionSpy.mockRestore();
	});

	it("should ignore version validation if coin is not in the minimum version list", async () => {
		const coinSpy = jest.spyOn(wallet.coin().network(), "coin").mockReturnValue("BTC");

		await expect(hasRequiredAppVersion(wallet.coin())).resolves.toBe(true);

		coinSpy.mockRestore();
	});
});
