import { Contracts } from "@ardenthq/sdk-profiles";
import { act, renderHook } from "@testing-library/react";
import React from "react";

import { useVoteFilters } from "./use-vote-filters";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

const ARK_MAINNET_NETWORK_ID = "ark.mainnet";
const ARK_DEVNET_NETWORK_ID = "ark.devnet";

describe("Use Vote Filters", () => {
	beforeAll(async () => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		profile.wallets().flush();
	});

	it("should include only wallets from the active network", async () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const { wallet: arkMainWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARK_MAINNET_NETWORK_ID,
		});
		profile.wallets().push(arkMainWallet);

		const { wallet: arkDevWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARK_DEVNET_NETWORK_ID,
		});
		profile.wallets().push(arkDevWallet);

		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...config,
			activeNetworkId: ARK_MAINNET_NETWORK_ID,
		});

		const { result } = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: arkMainWallet }),
			{ wrapper },
		);

		expect(result.current.filteredWallets).toHaveLength(1);
		expect(result.current.filteredWallets[0].network().id()).toBe(ARK_MAINNET_NETWORK_ID);

		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...config,
			activeNetworkId: ARK_DEVNET_NETWORK_ID,
		});

		const { result: updatedResult } = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: arkMainWallet }),
			{ wrapper },
		);

		expect(updatedResult.current.filteredWallets).toHaveLength(1);
		expect(updatedResult.current.filteredWallets[0].network().id()).toBe(ARK_DEVNET_NETWORK_ID);

		resetProfileNetworksMock();
	});

	it("should filter wallets based on walletsDisplayType", async () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const { wallet: starredWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARK_MAINNET_NETWORK_ID,
		});
		starredWallet.toggleStarred();
		profile.wallets().push(starredWallet);

		const { wallet: normalWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARK_MAINNET_NETWORK_ID,
		});
		profile.wallets().push(normalWallet);

		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...config,
			activeNetworkId: ARK_MAINNET_NETWORK_ID,
		});

		const { result } = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: starredWallet }),
			{ wrapper },
		);

		expect(result.current.filteredWallets).toHaveLength(2);

		act(() => {
			result.current.filterFilters.onChange("walletsDisplayType", "starred");
		});
		expect(result.current.filteredWallets).toHaveLength(1);
		expect(result.current.filteredWallets[0].isStarred()).toBe(true);

		act(() => {
			result.current.filterFilters.onChange("walletsDisplayType", "ledger");
		});
		expect(result.current.filteredWallets).toHaveLength(0);

		resetProfileNetworksMock();
	});

	it("should filter wallets based on search query", async () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const { wallet: wallet1 } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARK_MAINNET_NETWORK_ID,
		});
		wallet1.mutator().alias("Wallet 1");
		profile.wallets().push(wallet1);

		const { wallet: wallet2 } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARK_MAINNET_NETWORK_ID,
		});
		wallet2.mutator().alias("Wallet 2");
		profile.wallets().push(wallet2);

		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...config,
			activeNetworkId: ARK_MAINNET_NETWORK_ID,
		});

		const { result } = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: wallet1 }),
			{ wrapper },
		);

		expect(result.current.filteredWallets).toHaveLength(2);

		act(() => {
			result.current.setSearchQuery("Wallet 1");
		});
		expect(result.current.filteredWallets).toHaveLength(1);
		expect(result.current.filteredWallets[0].alias()).toBe("Wallet 1");

		resetProfileNetworksMock();
	});

	it("should set hasEmptyResults and hasWallets correctly", async () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...config,
			activeNetworkId: ARK_MAINNET_NETWORK_ID,
		});

		const { result, rerender } = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: profile.wallets().first() }),
			{ wrapper },
		);

		expect(result.current.hasWallets).toBe(false);
		expect(result.current.hasEmptyResults).toBe(true);

		const { wallet: wallet1 } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARK_MAINNET_NETWORK_ID,
		});
		profile.wallets().push(wallet1);
		rerender();

		expect(result.current.hasWallets).toBe(true);
		expect(result.current.hasEmptyResults).toBe(false);

		act(() => {
			result.current.setSearchQuery("nonexistent");
		});
		expect(result.current.hasEmptyResults).toBe(true);

		resetProfileNetworksMock();
	});
});
