import React from "react";

import { TransactionDetailAddressList } from "./TransactionDetailAddressList";
import { translations } from "../../../i18n";
import { TransactionFixture } from "../../../../../tests/fixtures/transactions";
import { render, screen, renderResponsive } from "../../../../../utils/testing-library";

describe("TransactionDetailAddressList", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render addresses in xs", (breakpoint) => {
		const addresses = [
			{
				address: "test-address1",
			},
			{
				address: "test-address2",
			},
		];

		const { container } = renderResponsive(
			<TransactionDetailAddressList transaction={TransactionFixture} addresses={addresses} />,
			breakpoint,
		);

		expect(screen.getByTestId("TransactionDetailAddressList")).toBeInTheDocument();
		expect(screen.getByText(`${translations.RECIPIENTS} (2)`)).toBeInTheDocument();
		expect(screen.getAllByText(translations.VIEW_RECIPIENTS_LIST)[0]).toBeInTheDocument();
		expect(screen.getByText(addresses[0].address)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should show recipient with alias", () => {
		const addresses = [
			{
				address: "test-address1",
				alias: "alias-address1",
			},
			{
				address: "test-address2",
				alias: "alias-address2",
			},
		];

		render(<TransactionDetailAddressList transaction={TransactionFixture} addresses={addresses} />);

		expect(screen.getByText(addresses[0].alias)).toBeInTheDocument();
		expect(screen.getByText(addresses[0].address)).toBeInTheDocument();
	});

	it("should render the delegate icon if isDelegate", () => {
		const addresses = [
			{
				address: "test-address1",
				isDelegate: true,
			},
			{
				address: "test-address2",
			},
		];

		render(<TransactionDetailAddressList transaction={TransactionFixture} addresses={addresses} />);

		// eslint-disable-next-line testing-library/no-node-access
		expect(document.querySelector("svg#delegate-registration")).toBeInTheDocument();
	});

	it("should show the sender address if it's a returned transaction", () => {
		const { address: senderAddress, alias: senderAlias } = TransactionFixture.wallet();

		const addresses = [
			{
				address: "test-address1",
				isDelegate: true,
			},
			{
				address: senderAddress(),
				alias: senderAlias(),
			},
		];

		render(
			<TransactionDetailAddressList
				transaction={{ ...TransactionFixture, isReturn: () => true }}
				addresses={addresses}
			/>,
		);

		expect(screen.getByText(senderAddress())).toBeInTheDocument();
		expect(screen.getByText(senderAlias())).toBeInTheDocument();
	});
});
