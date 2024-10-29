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
					network={wallet.network()}
					profile={profile}
					publicKeys={[
						"034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
						"02e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
					]}
					transaction={{
						...TransactionFixture,
						publicKeys: () => [
							"034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
							"02e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
						],
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("TableRow")).toHaveLength(2);
		});
	});

	it("should render with musig participants and use explorer links", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionMusigParticipants
					network={wallet.network()}
					profile={profile}
					useExplorerLinks
					publicKeys={[
						"034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
						"02e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
					]}
					transaction={{
						...TransactionFixture,
						publicKeys: () => [
							"034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
							"02e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
						],
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("TableRow")).toHaveLength(2);
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("Link")).toHaveLength(2);
		});
	});
});
