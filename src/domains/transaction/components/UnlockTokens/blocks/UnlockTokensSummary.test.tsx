import React from "react";
import { Route } from "react-router-dom";

import { UnlockTokensSummary } from "./UnlockTokensSummary";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render } from "@/utils/testing-library";

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
							currency: () => "LSK",
							network: () => ({
								coin: () => "LSK",
								displayName: () => "LISK Testnet",
								id: () => "lsk.testnet",
								isLive: () => false,
								isTest: () => true,
								ticker: () => "LSK",
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
