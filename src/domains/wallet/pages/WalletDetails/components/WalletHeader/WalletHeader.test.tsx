import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";

import { WalletHeader } from "./WalletHeader";
import * as envHooks from "@/app/hooks/env";
import { env, getDefaultProfileId, renderResponsiveWithRoute, screen } from "@/utils/testing-library";

const history = createHashHistory();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let votes: Contracts.VoteRegistryItem[];
let walletUrl: string;

describe("WalletHeader", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		votes = wallet.voting().current();

		await wallet.synchroniser().votes();
		await wallet.synchroniser().identity();
		await wallet.synchroniser().coin();

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}`;

		history.push(walletUrl);
	});

	it("should render", async () => {
		const { asFragment } = renderResponsiveWithRoute(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={votes}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
