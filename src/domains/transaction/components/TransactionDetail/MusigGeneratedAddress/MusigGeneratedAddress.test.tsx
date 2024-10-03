import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { MusigGeneratedAddress } from "./MusigGeneratedAddress";

const history = createHashHistory();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("MusigGeneratedAddress", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = await profile.wallets().last();
	});

	it("should render as link if explorer link prop is provided", async () => {
		vi.spyOn(wallet.coin().address(), "fromMultiSignature").mockResolvedValue({ address: wallet.address() });
		vi.spyOn(wallet.profile().walletFactory(), "fromAddress").mockResolvedValue(wallet);

		const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<MusigGeneratedAddress
					wallet={wallet}
					useExploreLink
					min={2}
					publicKeys={[wallet.publicKey()!, profile.wallets().first().publicKey()!]}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("Link")).resolves.toBeVisible();
	});
});
