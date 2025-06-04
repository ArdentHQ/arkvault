import { vi, describe, it, expect, beforeAll } from "vitest";
import {
	hasNetworksWithLedgerSupport,
	isCustomNetwork,
	networkDisplayName,
	profileAllEnabledNetworks,
	profileAllEnabledNetworkIds,
	profileEnabledNetworkIds,
	networksAsOptions,
	findNetworkFromSearchParameters,
} from "./network-utils";
import { env, getMainsailProfileId } from "./testing-library";

let profile;

beforeAll(() => {
	profile = env.profiles().findById(getMainsailProfileId());
});

describe("network-utils", () => {
	it("should have available networks with ledger support", () => {
		const networks = profile.availableNetworks();
		const ledgerSpy = vi.spyOn(networks[0], "allows").mockReturnValue(true);
		expect(hasNetworksWithLedgerSupport(profile)).toBe(true);
		ledgerSpy.mockRestore();
	});

	it("should not have available networks with ledger support", () => {
		const networks = profile.availableNetworks();
		const ledgerSpy = vi.spyOn(networks[0], "allows").mockReturnValue(false);
		expect(hasNetworksWithLedgerSupport(profile)).toBe(false);
		ledgerSpy.mockRestore();
	});

	it("isCustomNetwork true when id ends with .custom", () => {
		const network = { id: () => "foo.custom" };
		expect(isCustomNetwork(network)).toBe(true);
	});
	it("isCustomNetwork false when id does not end with .custom", () => {
		const network = { id: () => "mainnet" };
		expect(isCustomNetwork(network)).toBe(false);
	});

	it("isCustomNetwork handles undefined", () => {
		expect(isCustomNetwork(undefined)).toBe(false);
	});

	it("networkDisplayName returns '' for undefined", () => {
		expect(networkDisplayName(undefined)).toBe("");
	});
	it("networkDisplayName returns coinName for custom network", () => {
		const network = { id: () => "foo.custom", coinName: () => "FOO" };
		expect(networkDisplayName(network)).toBe("FOO");
	});
	it("networkDisplayName returns displayName for normal network", () => {
		const network = profile.availableNetworks()[0];
		expect(networkDisplayName(network)).toBe(network.displayName());
	});

	it("profileAllEnabledNetworks filters by enabled for custom", () => {
		const custom = { id: () => "foo.custom", meta: () => ({ enabled: false }) };
		const fakeProfile = { availableNetworks: () => [custom] };
		expect(profileAllEnabledNetworks(fakeProfile)).toEqual([]);
	});
	it("profileAllEnabledNetworks returns all for normal", () => {
		const networks = profile.availableNetworks();
		expect(profileAllEnabledNetworks(profile)).toEqual(networks);
	});

	it("profileAllEnabledNetworkIds returns ids", () => {
		const networks = profile.availableNetworks();
		expect(profileAllEnabledNetworkIds(profile)).toEqual(networks.map((n) => n.id()));
	});

	it("profileEnabledNetworkIds returns unique ids", () => {
		const ids = profileEnabledNetworkIds(profile);
		expect(Array.isArray(ids)).toBe(true);
		// Should match availableNetworks ids
		const expected = profile.availableNetworks().map((n) => n.id());
		expect(ids).toEqual(expected);
	});

	it("networksAsOptions returns [] for undefined", () => {
		expect(networksAsOptions(undefined)).toEqual([]);
	});
	it("networksAsOptions returns options for networks", () => {
		const networks = profile.availableNetworks();
		const options = networksAsOptions(networks);
		expect(Array.isArray(options)).toBe(true);
		if (options.length > 0) {
			expect(options[0]).toHaveProperty("label");
			expect(options[0]).toHaveProperty("value");
		}
	});
	it("networksAsOptions adds name for test network", () => {
		// This network is a test network but NOT custom.
		const testNetworkNonCustom = {
			id: () => "testnet.real",
			coinName: () => "ARK",
			isTest: () => true,
			name: () => "TestnetReal",
			displayName: () => "ARK Testnet Real",
			meta: () => ({ nethash: "mocknethash", enabled: true }),
			allows: () => false,
		};
		const options = networksAsOptions([testNetworkNonCustom]);
		expect(options).toEqual([
			{
				isTestNetwork: true,
				label: `${testNetworkNonCustom.coinName()} ${testNetworkNonCustom.name()}`,
				value: testNetworkNonCustom.id(),
			},
		]);
	});

	it("networksAsOptions does not add name for custom test network", () => {
		// This network is both a test network AND custom.
		const testNetworkCustom = {
			id: () => "testnet.custom", // Ensures isCustomNetwork(network) is true
			coinName: () => "CUST",
			isTest: () => true,
			name: () => "MyCustomTest",
			displayName: () => "Custom Testnet",
			meta: () => ({ nethash: "mocknethashcustom", enabled: true }),
			allows: () => false,
		};
		const options = networksAsOptions([testNetworkCustom]);
		expect(options).toEqual([
			// Label should NOT include network.name() because it is custom.
			{ isTestNetwork: true, label: testNetworkCustom.coinName(), value: testNetworkCustom.id() },
		]);
	});

	it("findNetworkFromSearchParameters finds by nethash", () => {
		const networks = profile.availableNetworks();
		const nethash = networks[0].meta().nethash;
		const params = new URLSearchParams({ nethash });
		expect(findNetworkFromSearchParameters(profile, params)).toBe(networks[0]);
	});
	it("findNetworkFromSearchParameters finds by network id", () => {
		const networks = profile.availableNetworks();
		const id = networks[0].id();
		const params = new URLSearchParams({ network: id });
		expect(findNetworkFromSearchParameters(profile, params)).toBe(networks[0]);
	});
	it("findNetworkFromSearchParameters returns undefined if not found", () => {
		const params = new URLSearchParams({ nethash: "zzz" });
		expect(findNetworkFromSearchParameters(profile, params)).toBeUndefined();
	});
	it("findNetworkFromSearchParameters returns undefined if no params", () => {
		const params = new URLSearchParams();
		expect(findNetworkFromSearchParameters(profile, params)).toBeUndefined();
	});
});
