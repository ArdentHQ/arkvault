import React, { useEffect } from "react";
import "jest-styled-components";
import { ExchangeSidePanel } from "./ExchangeSidePanel";
import { ExchangeProvider, useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";
import * as themeUtils from "@/utils/theme";
import * as ExchangeForm from "@/domains/exchange/components/ExchangeForm";
import userEvent from "@testing-library/user-event";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
	const { exchangeProviders, fetchProviders } = useExchangeContext();

	useEffect(() => {
		const _fetchProviders = async () => fetchProviders();

		if (!exchangeProviders?.length) {
			_fetchProviders();
		}
	}, [exchangeProviders, fetchProviders]);

	return children;
};

describe("ExchangeSidePanel", () => {
	it("should render", async () => {
		const exchangeURL = `/profiles/${getMainsailProfileId()}/exchange`;

		render(
			<ExchangeProvider>
				<Wrapper>
					<ExchangeSidePanel onOpenChange={() => {}} exchangeId="changenow" />
				</Wrapper>
			</ExchangeProvider>,
			{
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		const fromCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[0];
		const toCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[1];
		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(recipientDropdown).toBeDisabled();

		await waitFor(() => {
			expect(fromCurrencyDropdown).not.toBeDisabled();
		});

		await waitFor(() => {
			expect(toCurrencyDropdown).not.toBeDisabled();
		});
	});

	it.each(["light", "dark"])("should render %s theme", async (theme) => {
		vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementation(() => theme === "dark");

		const exchangeURL = `/profiles/${getMainsailProfileId()}/exchange`;

		render(
			<ExchangeProvider>
				<Wrapper>
					<ExchangeSidePanel onOpenChange={() => {}} exchangeId="changenow" />
				</Wrapper>
			</ExchangeProvider>,
			{
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeVisible();
		});
	});

	it("should render warning without exchange", async () => {
		const exchangeURL = `/profiles/${getMainsailProfileId()}/exchange/view?exchangeId=unknown`;

		render(
			<ExchangeProvider>
				<Wrapper>
					<ExchangeSidePanel onOpenChange={() => {}} exchangeId="changenow" />
				</Wrapper>
			</ExchangeProvider>,
			{
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.queryByTestId("ExchangeForm")).not.toBeInTheDocument();
		});
	});

	it("should fetch providers if not loaded yet", async () => {
		const exchangeURL = `/profiles/${getMainsailProfileId()}/exchange`;

		render(
			<ExchangeProvider>
				<ExchangeSidePanel onOpenChange={() => {}} exchangeId="changenow" />
			</ExchangeProvider>,
			{
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeVisible();
		});
	});
});
