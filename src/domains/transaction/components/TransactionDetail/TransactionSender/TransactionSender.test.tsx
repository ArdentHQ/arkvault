import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionSender } from "./TransactionSender";
import { env, getDefaultProfileId, queryElementForSvg, render, renderResponsiveWithRoute } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("TransactionSender", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<TransactionSender address={wallet.address()} network={wallet.network()} />
			</Route>,
			"xs",
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(wallet.address());
	});

	it("should render with address", () => {
		const { container } = render(
			<Route path="/profiles/:profileId">
				<TransactionSender address="test-address" />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent("test-address");
		expect(container).toMatchSnapshot();
	});

	it("should render with alias", () => {
		const { container } = render(
			<Route path="/profiles/:profileId">
				<TransactionSender address={wallet.address()} network={wallet.network()} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(wallet.address());
		expect(container).toHaveTextContent("ARK Wallet 1");
		expect(container).toMatchSnapshot();
	});

	it("should not render delegate icon", () => {
		const delegateMock = vi.spyOn(env.delegates(), "findByAddress").mockReturnValue({
			username: () => "delegate username",
		} as any);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<TransactionSender address={wallet.address()} network={wallet.network()} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(wallet.address());

		expect(queryElementForSvg(container, "delegate-registration")).toBeInTheDocument();

		expect(container).toMatchSnapshot();

		delegateMock.mockRestore();
	});
});
