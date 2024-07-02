import React from "react";
import { Route } from "react-router-dom";

import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { DelegateRegistrationDetail } from "./DelegateRegistrationDetail";

const fixtureProfileId = getDefaultProfileId();

describe("DelegateRegistrationDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(
			<DelegateRegistrationDetail
				isOpen={false}
				transaction={{ ...TransactionFixture, username: () => "Ark Wallet" }}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<DelegateRegistrationDetail
					isOpen={true}
					transaction={{ ...TransactionFixture, username: () => "Ark Wallet" }}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DELEGATE_REGISTRATION_DETAIL.TITLE,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
