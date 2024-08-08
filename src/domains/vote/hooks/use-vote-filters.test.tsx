import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import React from "react";

import { useVoteFilters } from "./use-vote-filters";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("Use Vote Filters", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should get wallets by coin", async () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const { wallet: arkMainWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(arkMainWallet);

		const {
			result: {
				current: { walletsByCoin },
			},
		} = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: profile.wallets().first() }),
			{ wrapper },
		);

		const networkIds = Object.keys(walletsByCoin);

		expect(networkIds).toHaveLength(2);
		expect(networkIds).toStrictEqual(["ark.mainnet", "ark.devnet"]);

		resetProfileNetworksMock();
	});

	it("should get wallets by excluding test network if unavailable", async () => {
		const { wallet: arkMainWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		const profileWalletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([arkMainWallet]);

		const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		const {
			result: {
				current: { walletsByCoin },
			},
		} = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: profile.wallets().first() }),
			{ wrapper },
		);

		const networkIds = Object.keys(walletsByCoin);

		expect(networkIds).toHaveLength(1);
		expect(networkIds).toStrictEqual(["ark.mainnet"]);

		resetProfileNetworksMock();
		profileWalletsSpy.mockRestore();
	});
});
