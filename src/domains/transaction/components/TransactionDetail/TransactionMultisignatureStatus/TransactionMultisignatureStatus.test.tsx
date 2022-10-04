import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionMultisignatureStatus } from "./TransactionMultisignatureStatus";
import { env, getDefaultProfileId, render, renderResponsiveWithRoute } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("TransactionMultisignatureStatus", () => {
	const status = {
		label: "Awaiting our signature",
		value: "isAwaitingOurSignature",
	};

	const isAwaitingFinalSignatureStatus = {
		label: "Awaiting final signature",
		value: "isAwaitingFinalSignature",
	};

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<TransactionMultisignatureStatus
					address={wallet.address()}
					network={wallet.network()}
					status={status}
				/>
			</Route>,
			breakpoint,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(status.label);
		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s awaiting final signature", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<TransactionMultisignatureStatus
					address={wallet.address()}
					network={wallet.network()}
					status={isAwaitingFinalSignatureStatus}
				/>
			</Route>,
			breakpoint,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(isAwaitingFinalSignatureStatus.label);
		expect(container).toMatchSnapshot();
	});

	it("should render with address", () => {
		const { container } = render(
			<Route path="/profiles/:profileId">
				<TransactionMultisignatureStatus address="test-address" status={status} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(status.label);
		expect(container).toMatchSnapshot();
	});

	it("should render with alias", () => {
		const { container } = render(
			<Route path="/profiles/:profileId">
				<TransactionMultisignatureStatus
					address={wallet.address()}
					network={wallet.network()}
					status={status}
				/>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(status.label);
		expect(container).toMatchSnapshot();
	});

	it("should not render delegate icon", () => {
		const delegateMock = vi.spyOn(env.delegates(), "findByAddress").mockReturnValue({
			username: () => "delegate username",
		} as any);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<TransactionMultisignatureStatus
					address={wallet.address()}
					network={wallet.network()}
					status={isAwaitingFinalSignatureStatus}
				/>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(isAwaitingFinalSignatureStatus.label);
		expect(container).toMatchSnapshot();

		delegateMock.mockRestore();
	});
});
