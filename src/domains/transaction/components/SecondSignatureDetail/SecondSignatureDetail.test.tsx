import React from "react";
import { Route } from "react-router-dom";

import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { SecondSignatureDetail } from "./SecondSignatureDetail";

const fixtureProfileId = getDefaultProfileId();

describe("SecondSignatureDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(<SecondSignatureDetail isOpen={false} transaction={TransactionFixture} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<SecondSignatureDetail isOpen={true} transaction={TransactionFixture} />
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SECOND_SIGNATURE_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal without a wallet alias", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<SecondSignatureDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						wallet: () => ({
							...TransactionFixture.wallet(),
							alias: () => void 0,
						}),
					}}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SECOND_SIGNATURE_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});
});
