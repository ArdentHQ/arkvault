import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { TransactionRowRecipient } from "./TransactionRowRecipient";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("TransactionRowRecipient", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile
			.wallets()
			.findByAddressWithNetwork(TransactionFixture.to(), TransactionFixture.wallet().network().id());
	});

	it("should render", () => {
		const { asFragment } = render(<TransactionRowRecipient transaction={TransactionFixture} profile={profile} />);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getByTestId("Address__alias")).toHaveTextContent(/Mainsail Wallet/);
		expect(screen.getByTestId("Address__address")).toHaveTextContent(wallet.address());
	});
});
