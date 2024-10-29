import React from "react";

import { LedgerConfirmation } from "./LedgerConfirmation";
import { translations } from "@/domains/transaction/i18n";
import { render, screen } from "@/utils/testing-library";

describe("LedgerConfirmation", () => {
	it("should render", () => {
		const { asFragment } = render(<LedgerConfirmation />);

		expect(screen.getByTestId("LedgerConfirmation-description")).toHaveTextContent(
			translations.LEDGER_CONFIRMATION.DESCRIPTION,
		);

		expect(screen.getByTestId("LedgerConfirmation-loading_message")).toHaveTextContent(
			translations.PENDING.STATUS_TEXT,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with children", () => {
		const { asFragment } = render(<LedgerConfirmation>confirmation</LedgerConfirmation>);

		expect(screen.getByTestId("LedgerReview__details")).toHaveTextContent(translations.TRANSACTION_DETAILS);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with children and custom heading", () => {
		const { asFragment } = render(<LedgerConfirmation detailsHeading="heading">confirmation</LedgerConfirmation>);

		expect(screen.getByTestId("LedgerReview__details")).toHaveTextContent("heading");

		expect(asFragment()).toMatchSnapshot();
	});
});
