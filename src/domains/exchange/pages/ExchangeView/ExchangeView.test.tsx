/* eslint-disable testing-library/no-node-access */
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import "jest-styled-components";
import { ExchangeView } from "./ExchangeView";
import { ExchangeProvider, useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import * as themeUtils from "@/utils/theme";
import * as ExchangeForm from "@/domains/exchange/components/ExchangeForm";
import userEvent from "@testing-library/user-event";

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

		render(
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
	});

	it.each(["light", "dark"])("should render %s theme", async (theme) => {
		vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementation(() => theme === "dark");

		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow`;

		history.push(exchangeURL);

		render(
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
	});

	it("should render warning without exchange", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=unknown`;

		history.push(exchangeURL);

		render(
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
	});

	it("should fetch providers if not loaded yet", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow`;

		history.push(exchangeURL);

		render(
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
	});

	it("should re-render exchange form reset clicked", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow`;

		history.push(exchangeURL);

		let renderCount = 0;

		const exchangeFormMock = vi.spyOn(ExchangeForm, "ExchangeForm").mockImplementation(({ resetForm }) => {
			useEffect(() => {
				renderCount++;
			}, []);

			return (
				<div>
					Exchange Form rendered
					<button data-testid="Reset" onClick={resetForm}>
						reset
					</button>
				</div>
			);
		});

		render(
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

		await expect(screen.findByTestId("Reset")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("Reset"));

		expect(renderCount).toBe(2);

		exchangeFormMock.mockRestore();
	});

	it("should not pass down `orderId` when reset clicked", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow&orderId=testOrderId`;

		history.push(exchangeURL);

		const exchangeFormMock = vi.spyOn(ExchangeForm, "ExchangeForm").mockImplementation(({ resetForm, orderId }) => (
			<div>
				Exchange Form rendered
				<p>{orderId}</p>
				<button data-testid="Reset" onClick={resetForm}>
					reset
				</button>
			</div>
		));

		render(
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

		await expect(screen.findByTestId("Reset")).resolves.toBeVisible();

		// order ID should be used
		await expect(screen.findByText("testOrderId")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("Reset"));

		// order ID should not be there
		await waitFor(() => expect(screen.queryByText("testOrderId")).not.toBeInTheDocument());

		exchangeFormMock.mockRestore();
	});
});
