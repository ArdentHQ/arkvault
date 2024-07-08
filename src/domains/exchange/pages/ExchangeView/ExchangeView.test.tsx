/* eslint-disable testing-library/no-node-access */
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import 'jest-styled-components';
import { ExchangeView } from "./ExchangeView";
import { ExchangeProvider, useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import * as themeUtils from "@/utils/theme";

const history = createHashHistory();

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

describe("ExchangeView", () => {
	it("should render", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow`;

		history.push(exchangeURL);

		const { container } = render(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>
						<ExchangeView />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				route: exchangeURL,
			},
		);

		expect(document.querySelector("svg#world-map")).toBeInTheDocument();

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

		expect(container).toMatchSnapshot();
	});

	it.each(["light", "dark"])("should render %s theme", async (theme) => {
		vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementation(() => theme === "dark");

		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow`;

		history.push(exchangeURL);

		const { container } = render(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>
						<ExchangeView />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				route: exchangeURL,
			},
		);

		expect(document.querySelector("svg#world-map")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeVisible();
		});

		expect(container).toMatchSnapshot();
	});

	it("should render warning without exchange", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=unknown`;

		history.push(exchangeURL);

		const { container } = render(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>
						<ExchangeView />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				route: exchangeURL,
			},
		);

		expect(document.querySelector("svg#world-map")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("ExchangeForm")).not.toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();
	});

	it("should fetch providers if not loaded yet", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow`;

		history.push(exchangeURL);

		// Since I am not adding the wrapper the providers are not loaded
		const { container } = render(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<ExchangeView />
				</ExchangeProvider>
			</Route>,
			{
				route: exchangeURL,
			},
		);

		expect(document.querySelector("svg#world-map")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeVisible();
		});

		expect(container).toMatchSnapshot();
	});
});
