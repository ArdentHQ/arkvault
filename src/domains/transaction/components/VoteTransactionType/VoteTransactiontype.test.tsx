import { Contracts } from "@/app/lib/profiles";

import { env, getDefaultProfileId, getDefaultWalletId, render, screen } from "@/utils/testing-library";

import React from "react";
import { VoteTransactionType } from "./VoteTransactionType";

describe("VoteTransactionType", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());
	});

	it("should render vote type", () => {
		render(
			<VoteTransactionType
				unvotes={[]}
				votes={[
					{
						amount: 10,
						wallet,
					},
				]}
			/>,
		);

		expect(screen.getByText("Validator")).toBeInTheDocument();
	});

	it("should render swap type", () => {
		render(
			<VoteTransactionType
				unvotes={[
					{
						amount: 10,
						wallet,
					},
				]}
				votes={[
					{
						amount: 10,
						wallet,
					},
				]}
				showValidator={true}
			/>,
		);

		expect(screen.getByText("Old Validator")).toBeInTheDocument();
	});
});
