import React from "react";
import { Route } from "react-router-dom";

import { UsernameRegistrationDetail } from "./UsernameRegistrationDetail";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();

describe("UsernameRegistrationDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(
			<UsernameRegistrationDetail
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
				<UsernameRegistrationDetail
					isOpen={true}
					transaction={{ ...TransactionFixture, username: () => "Ark Wallet" }}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_USERNAME_REGISTRATION_DETAIL.TITLE,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
