import { Contracts } from "@ardenthq/sdk-profiles";

import { env, getDefaultProfileId, mockNanoXTransport } from "@/utils/testing-library";

import { hasRequiredAppVersion } from "./validation";

describe("Persist App Validation", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let ledgerListenSpy: vi.SpyInstance;

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
		const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.3.0");

		await expect(hasRequiredAppVersion(wallet.coin())).resolves.toBe(true);

		versionSpy.mockRestore();
	});

	it("should not have minimum required app version", async () => {
		const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("1.3.0");

		await expect(hasRequiredAppVersion(wallet.coin())).resolves.toBe(false);

		versionSpy.mockRestore();
	});

	it("should ignore version validation if coin is not in the minimum version list", async () => {
		const coinSpy = vi.spyOn(wallet.coin().network(), "coin").mockReturnValue("BTC");

		await expect(hasRequiredAppVersion(wallet.coin())).resolves.toBe(true);

		coinSpy.mockRestore();
	});
});
