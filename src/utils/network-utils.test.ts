import { NodeConfigurationResponse } from "./../domains/setting/pages/Networks/Networks.contracts";
import { UserCustomNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { vi } from "vitest";
import {
	buildNetwork,
	enabledNetworksCount,
	findNetworkFromSearchParameters,
	hasNetworksWithLedgerSupport,
	isCustomNetwork,
	isMainsailNetwork,
	isValidKnownWalletUrlResponse,
	networkDisplayName,
	networkInitials,
	networksAsOptions,
	profileEnabledNetworkIds,
} from "./network-utils";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { ARK } from "@ardenthq/sdk-ark";
import { Mainsail } from "@ardenthq/sdk-mainsail";

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
	it("builds network with explorer", () => {
		const customNetwork: UserCustomNetwork = {
			address: "https://custom.network",
			name: "Custom Network",
			slip44: "0",
			explorer: "https://custom.network/explorer",
		};

		const customResponse: NodeConfigurationResponse = {
			nethash: "custom-nethash",
			slip44: 0,
			version: 1,
			wif: 1,
		};

		const network = buildNetwork(customNetwork, customResponse);

		expect(network.hosts).toEqual([
			{
				failedCount: 0,
				host: "https://custom.network",
				type: "full",
			},
			{
				host: "https://custom.network/explorer",
				type: "explorer",
			},
		]);
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

	it("determines if a network is custom", () => {
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

		expect(isCustomNetwork(network)).toBe(true);
	});

	describe("isValidKnownWalletUrlResponse", () => {
		it("determines known wallet url response is not valid for rejected", () => {
			const response: PromiseSettledResult<any> = {
				status: "rejected",
				reason: "error",
			};

			expect(isValidKnownWalletUrlResponse(response)).toBe(false);
		});

		it("determines known wallet url response is not valid for invalid json", () => {
			const response: PromiseSettledResult<any> = {
				status: "fulfilled",
				value: {
					body: () => {
						return "invalid";
					},
				},
			};

			expect(isValidKnownWalletUrlResponse(response)).toBe(false);
		});

		it("determines known wallet url response is not valid for exceptions", () => {
			const response: PromiseSettledResult<any> = {
				status: "fulfilled",
				value: {
					body: () => {
						throw new Error("error");
					},
				},
			};

			expect(isValidKnownWalletUrlResponse(response)).toBe(false);
		});

		it("determines known wallet url response is valid", () => {
			const response: PromiseSettledResult<any> = {
				status: "fulfilled",
				value: {
					body: () => {
						return JSON.stringify([]);
					},
				},
			};

			expect(isValidKnownWalletUrlResponse(response)).toBe(true);
		});
	});

	describe("networkDisplayName", () => {
		it.each([undefined, null])("returns empty if no network", (empty) => {
			expect(networkDisplayName(empty)).toBe("");
		});

		it("returns the coin name if is custom network", (empty) => {
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

			const manifest = buildNetwork(customNetwork, customResponse);

			const network = new Networks.Network(ARK.manifest, manifest);

			expect(networkDisplayName(network)).toBe("Custom Network");
		});

		it("returns the display name", (empty) => {
			const restoreMock = mockProfileWithPublicAndTestNetworks(profile);

			const network = profile.availableNetworks()[0];

			expect(networkDisplayName(network)).toBe("ARK");

			restoreMock();
		});
	});

	describe("profileEnabledNetworkIds", () => {
		it("returns enabled network ids", () => {
			const restoreMock = mockProfileWithPublicAndTestNetworks(profile);

			const networkIds = profileEnabledNetworkIds(profile);

			expect(networkIds).toEqual(["ark.devnet"]);

			restoreMock();
		});
	});
	describe("networksAsOptions", () => {
		it("returns networks as optons", () => {
			const restoreMock = mockProfileWithPublicAndTestNetworks(profile);

			const options = networksAsOptions(profile.availableNetworks());

			expect(options).toEqual([
				{
					isTestNetwork: false,
					label: "ARK",
					value: "ark.mainnet",
				},
				{
					isTestNetwork: true,
					label: "ARK Devnet",
					value: "ark.devnet",
				},
				{
					isTestNetwork: true,
					label: "ARK",
					value: "random.custom",
				},
			]);

			restoreMock();
		});
	});

	describe("isMainsailNetwork", () => {
		it("determines if a network is a mainsail network", () => {
			const network = new Networks.Network(Mainsail.manifest, Mainsail.manifest.networks["mainsail.devnet"]);

			expect(isMainsailNetwork(network)).toBe(true);
		});
		it("determines if a network is a not a mainsail network", () => {
			const network = new Networks.Network(ARK.manifest, ARK.manifest.networks["ark.devnet"]);

			expect(isMainsailNetwork(network)).toBe(false);
		});
	});
});
