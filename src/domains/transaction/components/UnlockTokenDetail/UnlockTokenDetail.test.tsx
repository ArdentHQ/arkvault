import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { UnlockTokenDetail } from "./UnlockTokenDetail";

const history = createHashHistory();

const transactionFixture = {
	...TransactionFixture,
	wallet: () => ({
		...TransactionFixture.wallet(),
		currency: () => "LSK",
	}),
};

describe("UnlockTokenDetail", () => {
	const dashboardUrl = `/profiles/${getDefaultProfileId()}/dashboard`;

	beforeEach(() => {
		history.push(dashboardUrl);
	});

	it("should not render if not open", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<UnlockTokenDetail isOpen={false} transaction={transactionFixture} onClose={vi.fn()} />,
			</Route>,
			{
				history,
				route: dashboardUrl,
			},
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<UnlockTokenDetail isOpen={true} transaction={transactionFixture} onClose={vi.fn()} />,
			</Route>,
			{
				history,
				route: dashboardUrl,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.TRANSACTION_TYPES.UNLOCK_TOKEN);
		expect(asFragment()).toMatchSnapshot();
	});
});
