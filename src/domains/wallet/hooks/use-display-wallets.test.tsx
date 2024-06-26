/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import React from "react";
import * as envHooks from "@/app/hooks/env";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import * as filterWalletsHooks from "@/domains/dashboard/components/FilterWallets/hooks";
import { useDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets";

import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, syncDelegates, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

const mainNetwork = "ark.mainnet";
const testNetwork = "ark.devnet";

describe("useDisplayWallets", () => {
	let mainnetWallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;
	let emptyProfile: Contracts.IProfile;
	let wallets: Contracts.IReadWriteWallet[];
	let resetProfileNetworksMock: () => void;

	const wrapper = ({ children }) => (
		<EnvironmentProvider env={env}>
			<ConfigurationProvider>{children}</ConfigurationProvider>
		</EnvironmentProvider>
	);

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		mainnetWallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: mainNetwork,
		});

		profile.wallets().push(mainnetWallet);
		await syncDelegates(profile);

		wallets = profile.wallets().values();

		emptyProfile = await env.profiles().create("Empty");

		vi.spyOn(mainnetWallet, "isLedger").mockReturnValue(true);
		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should return list of wallets by only one selected network", () => {
		const useWalletFiltersSpy = vi.spyOn(filterWalletsHooks, "useWalletFilters").mockReturnValue({
			selectedNetworkIds: [testNetwork],
			walletsDisplayType: "all",
		} as FilterWalletsHookProperties);

		const {
			result: { current },
		} = renderHook(() => useDisplayWallets(), {
			wrapper,
		});

		expect(current.availableWallets).toHaveLength(3);
		expect(current.availableWallets[0].address()).toBe(wallets[2].address());
		expect(current.availableWallets[1].alias()).toBe(wallets[0].alias());

		expect(current.availableNetworks).toHaveLength(2);
		expect(current.availableNetworks[0].id()).toBe(mainNetwork);

		expect(current.filteredWalletsGroupedByNetwork).toHaveLength(1);
		expect(current.filteredWalletsGroupedByNetwork[0][0].id()).toBe(testNetwork);
		expect(current.filteredWalletsGroupedByNetwork[0][1][0].alias()).toBe(wallets[0].alias());

		expect(current.hasWalletsMatchingOtherNetworks).toBeTruthy();

		expect(current.walletsGroupedByNetwork.size).toBe(2);
		expect(current.walletsGroupedByNetwork.has(wallets[0].network())).toBeTruthy();
		expect(current.walletsGroupedByNetwork.has(wallets[2].network())).toBeTruthy();
		expect(current.walletsGroupedByNetwork.get(wallets[0].network())).toHaveLength(2);

		useWalletFiltersSpy.mockRestore();
	});

	it("should return all list wallets", async () => {
		const useWalletFiltersSpy = vi.spyOn(filterWalletsHooks, "useWalletFilters").mockReturnValue({
			selectedNetworkIds: [testNetwork, mainNetwork],
			walletsDisplayType: "all",
		} as FilterWalletsHookProperties);

		const {
			result: { current },
		} = renderHook(() => useDisplayWallets(), {
			wrapper,
		});

		expect(current.availableWallets).toHaveLength(3);

		expect(current.availableNetworks).toHaveLength(2);

		expect(current.filteredWalletsGroupedByNetwork).toHaveLength(2);
		expect(current.filteredWalletsGroupedByNetwork[0][0].id()).toBe(mainNetwork);
		expect(current.filteredWalletsGroupedByNetwork[0][1][0].alias()).toBe(wallets[2].alias());

		expect(current.hasWalletsMatchingOtherNetworks).toBeFalsy();

		expect(current.walletsGroupedByNetwork.size).toBe(2);

		useWalletFiltersSpy.mockRestore();
	});

	it("should return properly sorted wallets", () => {
		const developmentWallet0AliasSpy = vi.spyOn(wallets[0], "alias").mockReturnValue(undefined);
		const developmentWallet1AliasSpy = vi.spyOn(wallets[1], "alias").mockReturnValue(undefined);

		const {
			result: { current },
		} = renderHook(() => useDisplayWallets(), {
			wrapper,
		});

		expect(current.availableWallets).toStrictEqual(
			wallets.sort(
				(a, b) =>
					a.network().coinName().localeCompare(b.network().coinName()) ||
					Number(a.network().isTest()) - Number(b.network().isTest()) ||
					Number(b.isStarred()) - Number(a.isStarred()) ||
					(a.alias() ?? "").localeCompare(b.alias() ?? ""),
			),
		);

		developmentWallet0AliasSpy.mockRestore();
		developmentWallet1AliasSpy.mockRestore();
	});

	it("should filter starred wallet types", async () => {
		const useWalletFiltersSpy = vi.spyOn(filterWalletsHooks, "useWalletFilters").mockReturnValue({
			selectedNetworkIds: [testNetwork, mainNetwork],
			walletsDisplayType: "starred",
		} as FilterWalletsHookProperties);

		const {
			result: { current },
		} = renderHook(() => useDisplayWallets(), {
			wrapper,
		});

		expect(current.availableWallets).toHaveLength(3);

		expect(current.availableNetworks).toHaveLength(2);

		expect(current.filteredWalletsGroupedByNetwork).toHaveLength(0);

		expect(current.hasWalletsMatchingOtherNetworks).toBeFalsy();

		expect(current.walletsGroupedByNetwork.size).toBe(2);

		useWalletFiltersSpy.mockRestore();
	});

	it("should filter ledger wallet type", async () => {
		const useWalletFiltersSpy = vi.spyOn(filterWalletsHooks, "useWalletFilters").mockReturnValue({
			selectedNetworkIds: [testNetwork, mainNetwork],
			walletsDisplayType: "ledger",
		} as FilterWalletsHookProperties);

		const {
			result: { current },
		} = renderHook(() => useDisplayWallets(), {
			wrapper,
		});

		expect(current.availableWallets).toHaveLength(3);

		expect(current.availableNetworks).toHaveLength(2);

		expect(current.filteredWalletsGroupedByNetwork).toHaveLength(1);
		expect(current.filteredWalletsGroupedByNetwork[0][0].id()).toBe(mainNetwork);
		expect(current.filteredWalletsGroupedByNetwork[0][1][0].address()).toBe(mainnetWallet.address());

		expect(current.hasWalletsMatchingOtherNetworks).toBeFalsy();

		expect(current.walletsGroupedByNetwork.size).toBe(2);

		useWalletFiltersSpy.mockRestore();
	});

	it("should return empty values", async () => {
		const useActiveProfileSpy = vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(emptyProfile);

		const { result } = renderHook(() => useDisplayWallets(), {
			wrapper,
		});

		expect(result.current.availableWallets).toHaveLength(0);
		expect(result.current.availableNetworks).toHaveLength(0);
		expect(result.current.filteredWalletsGroupedByNetwork).toHaveLength(0);
		expect(result.current.hasWalletsMatchingOtherNetworks).toBeFalsy();
		expect(result.current.walletsGroupedByNetwork.size).toBe(0);

		useActiveProfileSpy.mockRestore();
	});
});
