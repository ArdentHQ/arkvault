import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionRowSender } from "./TransactionRowSender";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, renderResponsive } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("TransactionRowSender", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile
			.wallets()
			.findByAddressWithNetwork(TransactionFixture.sender(), TransactionFixture.wallet().network().id());
	});

	it("should render", () => {
		const { asFragment } = render(<TransactionRowSender transaction={TransactionFixture} profile={profile} />);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(screen.getByTestId("Address__alias")).toHaveTextContent(wallet.alias());
		expect(screen.getByTestId("Address__address")).toHaveTextContent(wallet.address());
	});

	it("should render compact", () => {
		const { asFragment } = render(
			<TransactionRowSender transaction={TransactionFixture} profile={profile} isCompact />,
		);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(screen.getByTestId("Address__alias")).toHaveTextContent(wallet.alias());
		expect(screen.getByTestId("Address__address")).toHaveTextContent(wallet.address());
	});
	
	it.each(["xs", "sm"])("should render with right alignment on mobile view", (breakpoint) => {
		renderResponsive(
			<TransactionRowSender transaction={TransactionFixture} profile={profile} />,
			breakpoint
		);

		expect(screen.getByTestId("Address__alias").parentElement).toHaveClass("justify-end");	
	});

	it.each(["md", "lg", "xl"])("should render with left alignment on desktop view", (breakpoint) => {
		renderResponsive(
			<TransactionRowSender transaction={TransactionFixture} profile={profile} />,
			breakpoint
		);

		expect(screen.getByTestId("Address__alias").parentElement).not.toHaveClass("justify-end");	
	});

});
