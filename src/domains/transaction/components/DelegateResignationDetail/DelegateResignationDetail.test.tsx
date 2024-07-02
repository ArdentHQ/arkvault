import React from "react";
import { Route } from "react-router-dom";

import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { DelegateResignationDetail } from "./DelegateResignationDetail";

const fixtureProfileId = getDefaultProfileId();

describe("DelegateResignationDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(
			<DelegateResignationDetail
				isOpen={false}
				transaction={{
					...TransactionFixture,
					wallet: () => ({
						...TransactionFixture.wallet(),
						username: () => "ARK Wallet",
					}),
				}}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<DelegateResignationDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						wallet: () => ({
							...TransactionFixture.wallet(),
							username: () => "ARK Wallet",
						}),
					}}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DELEGATE_RESIGNATION_DETAIL.TITLE,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
