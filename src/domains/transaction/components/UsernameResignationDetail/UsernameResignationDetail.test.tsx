import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

import React from "react";
import { Route } from "react-router-dom";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { UsernameResignationDetail } from "./UsernameResignationDetail";
import { translations } from "@/domains/transaction/i18n";

const fixtureProfileId = getDefaultProfileId();

describe("UsernameResignationDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(
			<UsernameResignationDetail
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
				<UsernameResignationDetail
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
			translations.MODAL_Username_RESIGNATION_DETAIL.TITLE,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
