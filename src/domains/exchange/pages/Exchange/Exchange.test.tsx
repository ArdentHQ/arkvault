import "vi-extended";

import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory, HashHistory } from "history";
import nock from "nock";
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

let history: HashHistory;
let profile: Contracts.IProfile;

const exchangeBaseURL = "https://exchanges.arkvault.io";
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

describe("Exchange", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		history = createHashHistory();
		nock.cleanAll();
	});

	beforeEach(() => {
		history.push(exchangeURL);
	});

	afterEach(() => {
		nock.cleanAll();
		httpClient.clearCache();

		profile.exchangeTransactions().flush();
	});

	it("should render empty", async () => {
		nock(exchangeBaseURL).get("/api").reply(200, { data: [] });

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
		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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
		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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

		const historyMock = vi.spyOn(history, "push").mockImplementation();

		userEvent.click(screen.getByText("ChangeNOW"));

		await waitFor(() => {
			expect(historyMock).toHaveBeenCalledWith(expect.stringContaining("exchange/view"));
		});

		historyMock.mockRestore();
	});

	it("should navigate to history tab", async () => {
		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable__empty-message")).toBeInTheDocument();
	});

	it("should show exchange transaction history", async () => {
		profile.exchangeTransactions().create(stubData);

		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());
		expect(screen.getAllByTestId("TableRemoveButton--compact")).toHaveLength(
			profile.exchangeTransactions().count(),
		);
	});

	it("should show exchange transaction history as not compact if user uses expanded tables", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		profile.exchangeTransactions().create(stubData);

		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRemoveButton")).toHaveLength(profile.exchangeTransactions().count());

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should show exchange transaction history as compact on md screen even if user uses expanded tables", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		profile.exchangeTransactions().create(stubData);

		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/exchange">
				<ExchangeProvider>
					<Wrapper>
						<Exchange />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			"md",
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		});

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRemoveButton--compact")).toHaveLength(
			profile.exchangeTransactions().count(),
		);

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should update exchange transaction status", async () => {
		const updateSpy = vi.spyOn(profile.exchangeTransactions(), "update");
		const exchangeTransaction = profile.exchangeTransactions().create(stubData);

		nock(exchangeBaseURL)
			.get("/api")
			.reply(200, require("tests/fixtures/exchange/exchanges.json"))
			.get("/api/changenow/orders/id")
			.query(true)
			.reply(200, { data: { id: exchangeTransaction.orderId(), status: "finished" } });

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

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

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

		updateSpy.mockReset();
	});

	it("should navigate to exchange transaction", async () => {
		const exchangeTransaction = profile.exchangeTransactions().create(stubData);
		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus.Finished });

		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		const historyMock = vi.spyOn(history, "push").mockImplementation();

		userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[0]);

		await waitFor(() => {
			expect(historyMock).toHaveBeenCalledWith(expect.stringContaining("exchange/view"));
		});

		historyMock.mockRestore();
	});

	it("should delete exchange transaction", async () => {
		const toastSpy = vi.spyOn(toasts, "success").mockImplementation();

		const exchangeTransaction = profile.exchangeTransactions().create(stubData);
		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus.Finished });

		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

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

		nock(exchangeBaseURL).get("/api").reply(200, require("tests/fixtures/exchange/exchanges.json"));

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

		userEvent.click(screen.getByText(translations.NAVIGATION.TRANSACTIONS));

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeTransactionsTable")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});
});
