import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { MultiPaymentDetail } from "./MultiPaymentDetail";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();

describe("MultiPaymentDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(
			<MultiPaymentDetail
				isOpen={false}
				transaction={{
					...TransactionFixture,
					blockId: () => "adsad12312xsd1w312e1s13203e12",
				}}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<MultiPaymentDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						blockId: () => "adsad12312xsd1w312e1s13203e12",
					}}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with recipients", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<MultiPaymentDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						blockId: () => "adsad12312xsd1w312e1s13203e12",
						isConfirmed: () => true,
						recipients: () => [
							{
								address: "adsad12312xsd1w312e1s13203e12",
								amount: 200,
							},
							{
								address: "adsad12312xsd1w312e1s13203e13",
								amount: 1990,
							},
							{
								address: "adsad12312xsd1w312e1s13203e14",
								amount: 1990,
							},
						],
					}}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
		expect(screen.getByTestId("TransactionDetailAddressList")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render hint icon with tooltip when it's a returned transaction", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<MultiPaymentDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						blockId: () => "adsad12312xsd1w312e1s13203e12",
						isConfirmed: () => true,
						isReturn: () => true,
						recipients: () => [
							{
								address: "adsad12312xsd1w312e1s13203e12",
								amount: 200,
							},
							{
								address: TransactionFixture.sender(),
								amount: 99,
							},
							{
								address: "adsad12312xsd1w312e1s13203e14",
								amount: 1990,
							},
						],
					}}
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);

		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		expect(screen.getByText("Including 99 ARK sent to itself")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
