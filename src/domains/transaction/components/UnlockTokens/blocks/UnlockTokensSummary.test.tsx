import React from "react";
import { Route } from "react-router-dom";

import { UnlockTokensSummary } from "./UnlockTokensSummary";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, env } from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();

describe("UnlockTokensSummary", () => {
	it("should render", async () => {
		const profile = await env.profiles().create("empty");
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<UnlockTokensSummary
					transaction={{
						...TransactionFixture,
						wallet: () => ({
							...TransactionFixture.wallet(),
							currency: () => "ARK",
							id: () => "wallet-id",
							network: () => ({
								coin: () => "ARK",
								displayName: () => "ARK Devnet",
								id: () => "ark.devnet",
								isLive: () => false,
								isTest: () => true,
								ticker: () => "DARK",
							}),
							profile: () => profile,
						}),
					}}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
