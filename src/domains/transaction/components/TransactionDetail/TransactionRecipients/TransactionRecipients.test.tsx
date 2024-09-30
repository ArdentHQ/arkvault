import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionRecipients } from "./TransactionRecipients";
import { TransactionRecipientsMobile } from "./TransactionRecipientsMobile";
import { translations } from "@/domains/transaction/i18n";
import {
	env,
	getDefaultProfileId,
	queryElementForSvg,
	render,
	renderResponsive,
	renderResponsiveWithRoute,
	screen,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
const address = "test-address";
const currency = "DARK";

describe("TransactionRecipients", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionRecipients currency={currency} recipients={[{ address }]} />,
			breakpoint,
		);

		expect(container).toHaveTextContent(translations.RECIPIENT);
		expect(container).toHaveTextContent(address);

		expect(container).toMatchSnapshot();
	});

	it("should render a single recipient", () => {
		const { container } = render(<TransactionRecipients currency={currency} recipients={[{ address }]} />);

		expect(container).toHaveTextContent(translations.RECIPIENT);
		expect(container).toHaveTextContent(address);

		expect(container).toMatchSnapshot();
	});

	it("should not render if recipients array is not provided", () => {
		const { container } = render(<TransactionRecipients currency={currency} recipients={[]} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a single recipient with alias", () => {
		const alias = "test-alias";

		const { container } = render(<TransactionRecipients currency={currency} recipients={[{ address, alias }]} />);

		expect(container).toHaveTextContent(address);
		expect(container).toHaveTextContent(alias);

		expect(container).toMatchSnapshot();
	});

	it("should render a single recipient that is delegate", () => {
		const { container } = render(
			<TransactionRecipients currency={currency} recipients={[{ address, isDelegate: true }]} />,
		);

		expect(container).toHaveTextContent(address);

		expect(queryElementForSvg(container, "delegate-registration")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render multiple recipients in %s", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<TransactionRecipients
					currency={currency}
					recipients={[
						{ address, amount: 1 },
						{ address, amount: 1 },
					]}
				/>
			</Route>,
			breakpoint,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(address);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render recipients with delegate icon in %s", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<TransactionRecipients
					currency={currency}
					recipients={[
						{ address, amount: 1, isDelegate: true },
						{ address, amount: 1 },
					]}
				/>
			</Route>,
			breakpoint,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toHaveTextContent(address);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render in %s when showAmount is set and multiple recipients", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionRecipients
				currency={currency}
				recipients={[
					{ address, amount: 100 },
					{ address, amount: 200 },
				]}
				showAmount={true}
			/>,
			breakpoint,
		);

		expect(container).toHaveTextContent(address);

		expect(screen.getAllByTestId("Amount")).toHaveLength(2);

		expect(container).toMatchSnapshot();
	});

	it("should render transaction recipient mobile with label", () => {
		const { container } = render(<TransactionRecipientsMobile currency={currency} recipients={[{ address }]} label="test label"/>);

		expect(container).toHaveTextContent("test label");
	});
});
