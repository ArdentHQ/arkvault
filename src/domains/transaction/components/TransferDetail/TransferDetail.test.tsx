import React from "react";
import { Route } from "react-router-dom";

import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { TransferDetail } from "./TransferDetail";

const fixtureProfileId = getDefaultProfileId();

describe("TransferDetail", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransferDetail
					isOpen={false}
					transaction={{ ...TransactionFixture, blockId: () => "adsad12312xsd1w312e1s13203e12" }}
					ticker="BTC"
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}/dashboard`,
			},
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransferDetail
					isOpen={true}
					transaction={{ ...TransactionFixture, blockId: () => "adsad12312xsd1w312e1s13203e12" }}
					ticker="BTC"
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}/dashboard`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as not is sent", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransferDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						blockId: () => "adsad12312xsd1w312e1s13203e12",
						isSent: () => false,
					}}
					ticker="BTC"
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}/dashboard`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with wallet alias", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransferDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						blockId: () => "adsad12312xsd1w312e1s13203e12",
						isSent: () => false,
					}}
					walletAlias="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
					ticker="BTC"
				/>
			</Route>,
			{
				route: `/profiles/${fixtureProfileId}/dashboard`,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});
});
