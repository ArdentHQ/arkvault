import { NodeConfigurationResponse } from "./../domains/setting/pages/Networks/Networks.contracts";
import { UserCustomNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { vi } from "vitest";
import {
	buildNetwork,
	enabledNetworksCount,
	findNetworkFromSearchParameters,
	hasNetworksWithLedgerSupport,
	networkInitials,
} from "./network-utils";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";
import { Contracts } from "@ardenthq/sdk-profiles";

let profile: Contracts.IProfile;

describe("Network utils", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should have available networks with ledger support", () => {
		const networks = profile
			.wallets()
			.values()
			.map((wallet) => wallet.network());

		const networkSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue(networks);
		const ledgerSpy = vi.spyOn(networks.at(0), "allowsLedger").mockReturnValue(true);

		const withLedgerSupport = hasNetworksWithLedgerSupport(profile);
		expect(withLedgerSupport).toBe(true);

		networkSpy.mockRestore();
		ledgerSpy.mockRestore();
	});

	it("should not have available networks with ledger support", () => {
		const networks = profile
			.wallets()
			.values()
			.map((wallet) => wallet.network());

		const networkSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue(networks);
		const ledgerSpy = vi.spyOn(networks.at(0), "allowsLedger").mockReturnValue(false);

		const withLedgerSupport = hasNetworksWithLedgerSupport(profile);
		expect(withLedgerSupport).toBe(false);

		networkSpy.mockRestore();
		ledgerSpy.mockRestore();
	});

	it("builds network", () => {
		const customNetwork: UserCustomNetwork = {
			address: "https://custom.network",
			name: "Custom Network",
			slip44: "0",
		};

		const customResponse: NodeConfigurationResponse = {
			nethash: "custom-nethash",
			slip44: 0,
			version: 1,
			wif: 1,
		};

		const network = buildNetwork(customNetwork, customResponse);

		expect(network.coin).toBe("Custom Network");
	});

	it("get enabled networks count", () => {
		const count = enabledNetworksCount(profile);

		expect(count).toBe(0);

		const restoreMock = mockProfileWithPublicAndTestNetworks(profile);

		const countWithNetworks = enabledNetworksCount(profile);

		expect(countWithNetworks).toBe(2);

		restoreMock();
	});

	it("find network by nethash", () => {
		const restoreMock = mockProfileWithPublicAndTestNetworks(profile);

		const searchParams = new URLSearchParams({ nethash: profile.availableNetworks()[1].meta().nethash });
		const network = findNetworkFromSearchParameters(profile, searchParams);
		expect(network).toEqual(profile.availableNetworks()[1]);

		const searchParams2 = new URLSearchParams({ nethash: "none" });
		expect(findNetworkFromSearchParameters(profile, searchParams2)).toBeUndefined();

		restoreMock();
	});

	it("find network by network id", () => {
		const restoreMock = mockProfileWithPublicAndTestNetworks(profile);

		const searchParams = new URLSearchParams({ network: profile.availableNetworks()[1].id() });
		const network = findNetworkFromSearchParameters(profile, searchParams);
		expect(network).toEqual(profile.availableNetworks()[1]);

		const searchParams2 = new URLSearchParams({ network: "none" });
		expect(findNetworkFromSearchParameters(profile, searchParams2)).toBeUndefined();

		restoreMock();
	});

	it.each([
		["Custom Network", "CU"],
		["ARK Devnet", "AR"],
	])("gets network initials", (name, initials) => {
		const customNetwork: UserCustomNetwork = {
			address: "https://custom.network",
			name,
			slip44: "0",
		};

		const customResponse: NodeConfigurationResponse = {
			nethash: "custom-nethash",
			slip44: 0,
			version: 1,
			wif: 1,
		};

		const network = buildNetwork(customNetwork, customResponse);

		expect(networkInitials(network)).toBe(initials);
	});
});
