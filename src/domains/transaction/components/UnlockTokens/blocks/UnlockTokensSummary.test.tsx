import React from "react";
import { Route } from "react-router-dom";

import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render } from "@/utils/testing-library";

import { UnlockTokensSummary } from "./UnlockTokensSummary";

const fixtureProfileId = getDefaultProfileId();

describe("UnlockTokensSummary", () => {
	it("should render", () => {
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
