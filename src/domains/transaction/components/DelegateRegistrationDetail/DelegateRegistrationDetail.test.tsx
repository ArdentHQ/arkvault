import React from "react";
import { Route } from "react-router-dom";
import { DelegateRegistrationDetail } from "./DelegateRegistrationDetail";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { translations } from "@/domains/transaction/i18n";

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

	it("should render a modal with validator public key when available", () => {
		render(
			<Route path="/profiles/:profileId">
				<DelegateRegistrationDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						asset: () => ({
							validatorPublicKey: "123",
						}),
						username: () => {},
						wallet: () => ({
							currency: () => "ARK",
							network: () => ({
								id: () => "mainsail.devnet",
							}),
						}),
					}}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DELEGATE_REGISTRATION_DETAIL.TITLE,
		);

		expect(screen.getAllByTestId("TransactionDetail").at(0)).toHaveTextContent("123");
	});
});
