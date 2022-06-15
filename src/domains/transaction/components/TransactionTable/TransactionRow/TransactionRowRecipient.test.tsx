import { Contracts } from "@ardenthq/sdk-profiles";
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
			.findByAddressWithNetwork(TransactionFixture.recipient(), TransactionFixture.wallet().network().id());
	});

	it("should render", () => {
		const { asFragment } = render(<TransactionRowRecipient transaction={TransactionFixture} profile={profile} />);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(screen.getByTestId("Address__alias")).toHaveTextContent(wallet.alias());
		expect(screen.getByTestId("Address__address")).toHaveTextContent(wallet.address());
	});

	it("should render compact", () => {
		const { asFragment } = render(
			<TransactionRowRecipient transaction={TransactionFixture} profile={profile} isCompact />,
		);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(screen.getByTestId("Address__alias")).toHaveTextContent(wallet.alias());
		expect(screen.getByTestId("Address__address")).toHaveTextContent(wallet.address());
	});
});
