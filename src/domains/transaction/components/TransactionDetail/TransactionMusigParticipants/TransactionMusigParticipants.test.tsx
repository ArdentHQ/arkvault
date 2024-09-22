import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionMusigParticipants } from "./TransactionMusigParticipants";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, syncDelegates, waitFor } from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("TransactionMusigParticipants", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
	});

	it("should render with musig participants", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionMusigParticipants
					profile={profile}
					transaction={{
						...TransactionFixture,
						publicKeys: () => ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192", "034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"],
						wallet: () => wallet
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("TableRow")).toHaveLength(2)
		})
	});
});
