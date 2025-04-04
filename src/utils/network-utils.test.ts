import { vi } from "vitest";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { hasNetworksWithLedgerSupport } from "./network-utils";

process.env.RESTORE_MAINSAIL_PROFILE = "true";

describe("Network utils", () => {
	it("should have available networks with ledger support", () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const networks = profile
			.wallets()
			.values()
			.map((wallet) => wallet.network());

		const networkSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue(networks);
		const ledgerSpy = vi.spyOn(networks.at(0), "allows").mockReturnValue(true);

		const withLedgerSupport = hasNetworksWithLedgerSupport(profile);
		expect(withLedgerSupport).toBe(true);

		networkSpy.mockRestore();
		ledgerSpy.mockRestore();
	});

	it("should not have available networks with ledger support", () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const networks = profile
			.wallets()
			.values()
			.map((wallet) => wallet.network());

		const networkSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue(networks);
		const ledgerSpy = vi.spyOn(networks.at(0), "allows").mockReturnValue(false);

		const withLedgerSupport = hasNetworksWithLedgerSupport(profile);
		expect(withLedgerSupport).toBe(false);

		networkSpy.mockRestore();
		ledgerSpy.mockRestore();
	});
});
