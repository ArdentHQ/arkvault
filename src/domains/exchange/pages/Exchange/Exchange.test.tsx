import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory, HashHistory } from "history";
import React, { useEffect } from "react";
import { Trans } from "react-i18next";
import { Route } from "react-router-dom";

import { Exchange } from "./Exchange";
import { httpClient, toasts } from "@/app/services";
import { ExchangeProvider, useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { translations } from "@/domains/exchange/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	within,
	renderResponsiveWithRoute,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

let history: HashHistory;
let profile: Contracts.IProfile;

const exchangeBaseURL = "https://exchanges.arkvault.io/api";
const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange`;

const stubData = {
	input: {
		address: "inputAddress",
		amount: 1,
		ticker: "btc",
	},
	orderId: "id",
	output: {
		address: "outputAddress",
		amount: 100,
		ticker: "ark",
	},
	provider: "changenow",
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
	const { exchangeProviders, fetchProviders } = useExchangeContext();

	useEffect(() => {
		const _fetchProviders = async () => fetchProviders();

		if (!exchangeProviders?.length) {
			_fetchProviders();
		}
	}, [exchangeProviders, fetchProviders]);

	if (exchangeProviders?.length) {
		return children;
	}

	return <></>;
};

const mockExchangeTransaction = (profile: Contracts.IProfile) => {
	const exchangeTransaction = profile.exchangeTransactions().values()[0];

	const mockProfileExchangeTransactionValues = vi
		.spyOn(profile.exchangeTransactions(), "values")
		.mockReturnValue([exchangeTransaction]);

	const mockProfileExchangeTransactionFind = vi
		.spyOn(profile.exchangeTransactions(), "findById")
		.mockReturnValue(exchangeTransaction);

	return {
		restoreExchangeMocks: async () => {
			mockProfileExchangeTransactionValues.mockRestore();
			mockProfileExchangeTransactionFind.mockRestore();
			return await new Promise((resolve) => setTimeout(resolve, 100));
		},
	};
};

describe("Exchange", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		history = createHashHistory();
	});

	beforeEach(() => {
		history.push(exchangeURL);
	});

	afterEach(() => {
		httpClient.clearCache();

		profile.exchangeTransactions().flush();
	});

	it("should prevent from throwing if order status request fails", async () => {
		server.use(requestMock(exchangeBaseURL, { data: [] }));
		profile.exchangeTransactions().create({ ...stubData, provider: "changelly" });

		const mockTransactionOrderStatus = vi
			.spyOn(profile.exchangeTransactions().values().at(0), "provider")
			.mockImplementation(() => {
				throw new Error("Failed to fetch order status");
			});

		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Exchange />
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();
		});

		mockTransactionOrderStatus.mockRestore();
	});

	it("should render empty", async () => {
		server.use(requestMock(exchangeBaseURL, { data: [] }));

		const { container } = render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Exchange />
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();
	});

	it("should render with exchanges", async () => {
		const { container } = render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Exchange />
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await waitFor(() => {
			expect(screen.getAllByTestId("Card")).toHaveLength(2);
		});

		expect(screen.getByText("ChangeNOW")).toBeInTheDocument();
		expect(screen.getByText("Changelly")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should navigate to exchange", async () => {
		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Exchange />
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await waitFor(() => {
			expect(screen.getAllByTestId("Card")).toHaveLength(2);
		});

		const historyMock = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await userEvent.click(screen.getByText("ChangeNOW"));

		await waitFor(() => {
			expect(historyMock).toHaveBeenCalledWith(expect.stringContaining("exchange/view"));
		});

		historyMock.mockRestore();
	});

	it("should navigate to history tab", async () => {
		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Exchange />
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await waitFor(() => {
			expect(screen.getAllByTestId("Card")).toHaveLength(2);
		});

		await userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable__empty-message")).toBeInTheDocument();
	});

	it("should navigate to exchange transaction", async () => {
		const exchangeTransaction = profile.exchangeTransactions().create(stubData);
		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus.Finished });

		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Wrapper>
						<Exchange />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		const historyMock = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[0]);

		await waitFor(() => {
			expect(historyMock).toHaveBeenCalledWith(expect.stringContaining("exchange/view"));
		});

		historyMock.mockRestore();
	});

	it("should delete exchange transaction", async () => {
		const toastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());

		const exchangeTransaction = profile.exchangeTransactions().create(stubData);
		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus.Finished });

		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Wrapper>
						<Exchange />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("TableRow")).not.toBeInTheDocument();
		});

		expect(() => profile.exchangeTransactions().findById(exchangeTransaction.id())).toThrow("Failed to find");

		expect(toastSpy).toHaveBeenCalledWith(
			<Trans
				components={{ bold: <strong /> }}
				i18nKey="EXCHANGE.PAGE_EXCHANGES.DELETE_CONFIRMATION"
				values={{ orderId: exchangeTransaction.orderId() }}
			/>,
		);

		toastSpy.mockRestore();
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "DeleteResource__cancel-button"],
	])("should %s delete exchange transaction modal", async (_, buttonId) => {
		const exchangeTransaction = profile.exchangeTransactions().create(stubData);
		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus.Finished });

		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Exchange />
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should show exchange transaction history", async () => {
		profile.exchangeTransactions().create(stubData);
		mockExchangeTransaction(profile);

		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Wrapper>
						<Exchange />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		await userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());
		expect(screen.getAllByTestId("TableRemoveButton--compact")).toHaveLength(
			profile.exchangeTransactions().count(),
		);
	});

	it("should update exchange transaction status", async () => {
		const exchangeTransaction = profile.exchangeTransactions().values()[0];

		server.use(
			requestMock(`${exchangeBaseURL}/changenow/orders/id`, {
				data: { id: exchangeTransaction.orderId(), status: "finished" },
			}),
		);

		render(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Wrapper>
						<Exchange />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);
		/*
		await userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		await waitFor(() => {
			expect(updateSpy).toHaveBeenCalledWith(
				exchangeTransaction.id(),
				expect.objectContaining({
					status: Contracts.ExchangeTransactionStatus.Finished,
				}),
			);
		});

		updateSpy.mockReset(); */
	});
});
