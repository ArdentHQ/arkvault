import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import * as envHooks from "@/app/hooks/env";
import { WalletsGroupsList } from "@/domains/wallet/components/WalletsGroup/WalletsGroupsList";
import { env, getDefaultProfileId, render } from "@/utils/testing-library";

describe("WalletsGroupsList", () => {
	let profile: Contracts.IProfile;
	let mainnetWallet: Contracts.IReadWriteWallet;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		mainnetWallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		mainnetWallet.mutator().alias("AAA");

		profile.wallets().push(mainnetWallet);

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	it("should render WalletsGroupsList", () => {
		const { asFragment } = render(<WalletsGroupsList />);

		expect(asFragment()).toMatchSnapshot();
	});
});
