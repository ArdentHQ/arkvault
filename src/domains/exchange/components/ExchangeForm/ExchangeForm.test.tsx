import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashHistory, createHashHistory } from "history";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import {expect, vi} from "vitest";
import { cloneDeep } from "@ardenthq/sdk-helpers";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ConfirmationStep } from "./ConfirmationStep";
import { ExchangeForm } from "./ExchangeForm";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { StatusStep } from "./StatusStep";
import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	within,
} from "@/utils/testing-library";
import { ExchangeProvider, useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { httpClient, toasts } from "@/app/services";
import { requestMock, requestMockOnce, server } from "@/tests/mocks/server";
import * as useQueryParameters from "@/app/hooks/use-query-parameters";

import currencyEth from "@/tests/fixtures/exchange/changenow/currency-eth.json";
import order from "@/tests/fixtures/exchange/changenow/order.json";
import * as SendExchangeTransfer from "@/domains/exchange/components/SendExchangeTransfer"

let profile: Contracts.IProfile;

const exchangeBaseURL = "https://exchanges.arkvault.io";
const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view`;
const exchangeETHURL = "/api/changenow/currencies/eth";
let history: HashHistory;

const transactionStub = {
	input: {
		address: "payinAddress",
		amount: 1,
		hash: "payinHash",
		ticker: "btc",
	},
	orderId: "id",
	output: {
		address: "payoutAddress",
		amount: 100,
		hash: "payoutHash",
		ticker: "ark",
	},
	provider: "changenow",
};

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => setTimeout(callback, 200),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
	const { exchangeProviders, exchangeService, fetchProviders, provider, setProvider } = useExchangeContext();

	useEffect(() => {
		const _fetchProviders = async () => fetchProviders();

		if (!exchangeProviders?.length) {
			_fetchProviders();
		}
	}, [exchangeProviders, fetchProviders]);

	useEffect(() => {
		if (exchangeProviders && !provider) {
			setProvider(exchangeProviders[0]);
		}
	}, [exchangeProviders, exchangeService, provider]);

	if (provider) {
		return <>{children}</>;
	}

	return <></>;
};

const mockOrderStatus = (orderId: string, status: string) =>
	requestMock(`${exchangeBaseURL}/api/changenow/orders/${orderId}`, { data: { id: orderId, status } });

const selectCurrencies = async ({ from, to }: { from?: Record<string, string>; to?: Record<string, string> }) => {
	// from currency
	if (from) {
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).not.toBeDisabled();
		});

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toBeInTheDocument());
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[0], from.ticker);

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__option--0")[0]).toBeInTheDocument());
		await userEvent.click(screen.getAllByTestId("SelectDropdown__option--0")[0]);

		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(from.ticker);
		});

		await waitFor(() => {
			expect(screen.getByAltText(`${from.ticker} Icon`)).toBeInTheDocument();
		});
	}
	// to currency
	if (to) {
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).not.toBeDisabled();
		});

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[1]).toBeInTheDocument());
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[1], to.ticker);

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__option--0")[0]).toBeInTheDocument());
		await userEvent.click(screen.getAllByTestId("SelectDropdown__option--0")[0]);

		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(to.ticker);
		});

		await waitFor(() => {
			expect(screen.getByAltText(`${to.ticker} Icon`)).toBeInTheDocument();
		});
	}
};

const continueButton = () => screen.getByTestId("ExchangeForm__continue-button");
const reviewStep = () => screen.getByTestId("ExchangeForm__review-step");
const statusStep = () => screen.getByTestId("ExchangeForm__status-step");

const refundAddressID = "ExchangeForm__refund-address";
const payoutValue = "37042.3588384";

describe("ExchangeForm", () => {
	let findExchangeTransactionMock;
	let queryParametersMock;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		queryParametersMock = vi.spyOn(useQueryParameters, "useQueryParameters").mockImplementation(() => ({
			get: () => "changenow",
		}));
	});

	beforeEach(() => {
		profile.exchangeTransactions().flush();
		const exchangeTransaction = profile.exchangeTransactions().create(transactionStub);

		findExchangeTransactionMock = vi
			.spyOn(profile.exchangeTransactions(), "findById")
			.mockReturnValue(exchangeTransaction);

		history = createHashHistory();
		history.push(exchangeURL);
	});

	afterEach(() => {
		profile.exchangeTransactions().flush();

		httpClient.clearCache();
		findExchangeTransactionMock.mockRestore();
	});

	const renderComponent = (component: React.ReactNode) =>
		render(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>{component}</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				history,
				route: exchangeURL,
			},
		);

	it.each(["xs", "lg"])("should render (%s)", async (breakpoint) => {
		const onReady = vi.fn();

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>
						<ExchangeForm onReady={onReady} />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			breakpoint,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});
	});

	it("should render exchange form", async () => {
		const onReady = vi.fn();

		const { container } = renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

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

	it("should render exchange form with id of pending order", async () => {
		profile.exchangeTransactions().flush();

		const exchangeTransactionUpdateMock = vi
			.spyOn(profile.exchangeTransactions(), "update")
			.mockReturnValue(undefined);

		const onReady = vi.fn();

		const exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "payinAddress",
				amount: 1,
				hash: "payinHash",
				ticker: "btc",
			},
			orderId: "id",
			output: {
				address: "payoutAddress",
				amount: 100,
				hash: "payoutHash",
				ticker: "ark",
			},
			provider: "changenow",
		});

		server.use(mockOrderStatus(exchangeTransaction.orderId(), "new"));

		const { container } = renderComponent(
			<ExchangeForm orderId={exchangeTransaction.orderId()} onReady={onReady} />,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			statusStep();
		});

		expect(container).toMatchSnapshot();
		exchangeTransactionUpdateMock.mockRestore();
	});

	it("should go back to exchange page", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")).toHaveLength(3));
		const fromCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[0];
		const toCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[1];

		await waitFor(() => {
			expect(fromCurrencyDropdown).not.toBeDisabled();
		});

		await waitFor(() => {
			expect(toCurrencyDropdown).not.toBeDisabled();
		});

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());
		await userEvent.click(screen.getByTestId("ExchangeForm__back-button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${getDefaultProfileId()}/exchange`);
		});

		historySpy.mockRestore();
	});

	it("should show an error alert if the selected pair is unavailable", async () => {
		server.use(
			requestMock(`${exchangeBaseURL}${exchangeETHURL}`, currencyEth),
			requestMockOnce(
				`${exchangeBaseURL}/api/changenow/tickers/btc/eth`,
				{
					error: { message: "Unavailable Pair" },
				},
				{ status: 400 },
			),
			requestMock(`${exchangeBaseURL}/api/changenow/tickers/btc/eth`, undefined, { status: 500 }),
		);

		const onReady = vi.fn();

		const { container } = renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ethereum", ticker: "ETH" },
		});

		await waitFor(() => {
			expect(container).toHaveTextContent("The pair BTC / ETH is not available");
		});

		// remove to currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);

		await selectCurrencies({
			to: { name: "Ethereum", ticker: "ETH" },
		});

		await waitFor(() => {
			expect(container).not.toHaveTextContent("The pair BTC / ETH is not available");
		});
	});

	it("should show and hide refund address input", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

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

		await userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));
		await waitFor(() => {
			expect(screen.getByTestId(refundAddressID)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__remove-refund-address")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("ExchangeForm__remove-refund-address"));

		await waitFor(() => {
			expect(screen.queryByTestId(refundAddressID)).not.toBeInTheDocument();
		});
	});

	it("should show external id input if supported", async () => {
		const currency = cloneDeep(currencyEth);

		currency.data.externalIdName = "external id";
		currency.data.hasExternalId = true;

		server.use(requestMock(`${exchangeBaseURL}${exchangeETHURL}`, currency));

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ethereum", ticker: "ETH" },
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__external-id")).toBeInTheDocument();
		});

		const externalInput = within(screen.getByTestId("ExchangeForm__external-id")).getByRole("textbox");
		await userEvent.clear(externalInput);
		await userEvent.type(externalInput, "external-id");

		await waitFor(() => {
			expect(externalInput).toHaveValue("external-id");
		});
	});

	it("should show external id input for refund if supported", async () => {
		const currency = cloneDeep(currencyEth);

		currency.data.externalIdName = "external id";
		currency.data.hasExternalId = true;

		server.use(
			requestMock(`${exchangeBaseURL}/api/changenow/currencies/eth/payoutAddress`, { data: true }),
			requestMock(`${exchangeBaseURL}${exchangeETHURL}`, currency),
		);

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Ethereum", ticker: "ETH" },
			to: { name: "Bitcoin", ticker: "BTC" },
		});

		await userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));
		await waitFor(() => {
			expect(screen.getByTestId(refundAddressID)).toBeInTheDocument();
		});

		const refundDropdown = screen.getAllByTestId("SelectDropdown__input")[3];

		await userEvent.type(refundDropdown, "payoutAddress");

		await waitFor(() => {
			expect(refundDropdown).toHaveValue("payoutAddress");
		});

		expect(screen.getByTestId("ExchangeForm__refund-external-id")).toBeInTheDocument();

		const refundExternalInput = within(screen.getByTestId("ExchangeForm__refund-external-id")).getByRole("textbox");
		await userEvent.type(refundExternalInput, "refund-external-id");

		await waitFor(() => {
			expect(refundExternalInput).toHaveValue("refund-external-id");
		});
	});

	it("should swap currencies", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const fromCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[0];
		const toCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[1];

		expect(fromCurrencyDropdown).toHaveValue("BTC");
		expect(toCurrencyDropdown).toHaveValue("ARK");

		await userEvent.click(screen.getByTestId("ExchangeForm__swap-button"));

		await waitFor(() => {
			expect(fromCurrencyDropdown).toHaveValue("ARK");
		});

		expect(toCurrencyDropdown).toHaveValue("BTC");
	});

	it("should calculate amounts", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const payinInput: HTMLInputElement = screen.getAllByTestId("InputCurrency")[0] as HTMLInputElement;
		const payoutInput: HTMLInputElement = screen.getAllByTestId("InputCurrency")[1] as HTMLInputElement;

		// amount input
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// update amount output
		payoutInput.select();
		await userEvent.clear(payoutInput);
		await userEvent.type(payoutInput, "1");

		expect(payinInput).toHaveValue(payoutValue);

		// remove from currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).not.toHaveValue();
		});

		expect(payinInput).not.toHaveValue();

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
		});

		await waitFor(() => {
			expect(payinInput).toHaveValue(payoutValue);
		});
	});

	it("should remove amount if removing currency", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		await userEvent.clear(payinInput);
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// remove from currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);

		await waitFor(() => {
			expect(payinInput).not.toHaveValue();
		});

		// remove to currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);

		await waitFor(() => {
			expect(payoutInput).not.toHaveValue();
		});
	});

	it("should remove payout amount if removing payin amount", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		await userEvent.clear(payinInput);
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// remove payin amount
		await userEvent.clear(payinInput);

		await waitFor(() => {
			expect(payoutInput).not.toHaveValue();
		});
	});

	it("should remove payin amount if removing payout amount", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		await userEvent.clear(payinInput);
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// remove payout amount
		await userEvent.clear(payoutInput);

		await waitFor(() => {
			expect(payinInput).not.toHaveValue();
		});
	});

	it("should not update payin amount when there is no from currency", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		// remove from currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).not.toHaveValue();
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		await userEvent.clear(payoutInput);
		await userEvent.type(payoutInput, "1");

		await waitFor(() => {
			expect(payoutInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payinInput).not.toHaveValue();
		});
	});

	it("should not update payout amount when there is no to currency", async () => {
		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		// remove to currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).not.toHaveValue();
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).not.toHaveValue();
		});
	});

	it("should clear recipient address error when unsetting to currency", async () => {
		server.use(
			requestMock(`${exchangeBaseURL}${exchangeETHURL}`, currencyEth),
			requestMock(`${exchangeBaseURL}/api/changenow/currencies/eth/payoutAddress`, { data: false }),
		);

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ethereum", ticker: "ETH" },
		});

		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		await userEvent.type(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const recipientAddress = screen.getByTestId("ExchangeForm__recipient-address");

		await waitFor(() => {
			expect(within(recipientAddress).getAllByTestId("Input__error")).toHaveLength(2);
		});

		// remove to currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);

		await waitFor(() => {
			expect(within(recipientAddress).queryByTestId("Input__error")).not.toBeInTheDocument();
		});
	});

	it("should clear refund address error when unsetting from currency", async () => {
		server.use(
			requestMock(`${exchangeBaseURL}${exchangeETHURL}`, currencyEth),
			requestMockOnce(`${exchangeBaseURL}/api/changenow/currencies/eth/refundAddress`, undefined, {
				status: 500,
			}),
			requestMock(`${exchangeBaseURL}/api/changenow/currencies/eth/refundAddress`, { data: false }),
		);

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Ethereum", ticker: "ETH" },
			to: { name: "Bitcoin", ticker: "BTC" },
		});

		await userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));

		const refundAddress = screen.getByTestId(refundAddressID);

		expect(refundAddress).toBeVisible();

		const refundDropdown = screen.getAllByTestId("SelectDropdown__input")[3];

		await userEvent.type(refundDropdown, "refundAddress");

		await waitFor(() => {
			expect(refundDropdown).toHaveValue("refundAddress");
		});

		await waitFor(() => {
			expect(within(refundAddress).getAllByTestId("Input__error")).toHaveLength(2);
		});

		// remove from currency
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);

		await waitFor(() => {
			expect(within(refundAddress).queryByTestId("Input__error")).not.toBeInTheDocument();
		});
	});

	it("should show a generic error toast", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		server.use(
			requestMock(`${exchangeBaseURL}/api/changenow/orders`, "Server Error", { method: "post", status: 500 }),
		);

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(recipientDropdown).not.toBeDisabled();

		await userEvent.type(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		await userEvent.clear(payinInput);
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		await userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		// back to form step
		await userEvent.click(screen.getByTestId("ExchangeForm__back-button"));
		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__form-step")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		// go to review step
		await userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const toastSpy = vi.spyOn(toasts, "error").mockImplementation(vi.fn());

		// submit form
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(t("EXCHANGE.ERROR.GENERIC"));
		});

		toastSpy.mockRestore();
	});

	it("should show an error toast if the provided address is invalid", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		server.use(
			requestMock(
				`${exchangeBaseURL}/api/changenow/orders`,
				{ error: { message: "Invalid Address" } },
				{ method: "post", status: 422 },
			),
		);

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(recipientDropdown).not.toBeDisabled();

		await userEvent.type(recipientDropdown, "payoutAddress");

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		// amount input
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		await userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const toastSpy = vi.spyOn(toasts, "error").mockImplementation(vi.fn());

		// submit form
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(t("EXCHANGE.ERROR.INVALID_ADDRESS", { ticker: "ARK" }));
		});

		toastSpy.mockRestore();
	});

	it("should show an error toast if the provided refund address is invalid", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		server.use(
			requestMock(
				`${exchangeBaseURL}/api/changenow/orders`,
				{ error: { message: "Invalid Refund Address" } },
				{ method: "post", status: 422 },
			),
		);

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(recipientDropdown).not.toBeDisabled();

		await userEvent.type(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));
		await waitFor(() => {
			expect(screen.getByTestId(refundAddressID)).toBeInTheDocument();
		});

		const refundInput = within(screen.getByTestId(refundAddressID)).getByTestId("SelectDropdown__input");
		await userEvent.type(refundInput, "refundAddress");

		await waitFor(() => {
			expect(refundInput).toHaveValue("refundAddress");
		});

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		await userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const toastSpy = vi.spyOn(toasts, "error").mockImplementation(vi.fn());

		// submit form
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(t("EXCHANGE.ERROR.INVALID_REFUND_ADDRESS", { ticker: "BTC" }));
		});

		toastSpy.mockRestore();
	});

	it("should perform an exchange", async () => {
		profile.exchangeTransactions().flush();
		findExchangeTransactionMock.mockRestore();

		const baseStatus = {
			amountFrom: 1,
			amountTo: 100,
			from: "btc",
			id: "182b657b2c259b",
			payinAddress: "payinAddress",
			payoutAddress: "payoutAddress",
			status: "new",
			to: "ark",
		};

		server.use(
			requestMock(`${exchangeBaseURL}/api/changenow/orders`, order, { method: "post" }),
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: baseStatus }),
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, {
				data: { ...baseStatus, status: "exchanging" },
			}),
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, {
				data: { ...baseStatus, status: "sending" },
			}),
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, {
				data: {
					...baseStatus,
					payinHash: "payinHash",
					payoutHash: "payoutHash",
					status: "finished",
				},
			}),
		);

		const onReady = vi.fn();

		renderComponent(<ExchangeForm onReady={onReady} />);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
			to: { name: "Ark", ticker: "ARK" },
		});

		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(recipientDropdown).not.toBeDisabled();

		await userEvent.type(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		const exchangeTransaction = profile.exchangeTransactions().create(transactionStub);

		const findTransactionMock = vi
			.spyOn(profile.exchangeTransactions(), "findById")
			.mockReturnValue(exchangeTransaction);

		// amount input
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		findTransactionMock.mockRestore();

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		await userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		// back to form step
		await userEvent.click(screen.getByTestId("ExchangeForm__back-button"));
		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__form-step")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		// go to review step
		await userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		// submit form
		await userEvent.click(continueButton());

		await waitFor(() => {
			statusStep();
		});

		// status: awaiting confirmation
		await waitFor(() => {
			expect(screen.queryByTestId("StatusIcon__check-mark")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("StatusIcon__spinner")).toHaveLength(1);
		expect(screen.getAllByTestId("StatusIcon__empty")).toHaveLength(2);

		// status: finished
		await waitFor(
			() => {
				expect(screen.getAllByTestId("StatusIcon__check-mark")).toHaveLength(3);
			},
			{ timeout: 4000 },
		);

		expect(screen.queryByTestId("StatusIcon__spinner")).not.toBeInTheDocument();
		expect(screen.queryByTestId("StatusIcon__empty")).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__confirmation-step")).toBeInTheDocument();
		});

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await expect(
			screen.findByTestId("ExchangeForm__finish-button", undefined, { timeout: 4000 }),
		).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ExchangeForm__finish-button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${getDefaultProfileId()}/dashboard`);
		});

		historySpy.mockRestore();
	});

	it("should render exchange form with id of finished order", async () => {
		const onReady = vi.fn();

		profile.exchangeTransactions().flush();
		const exchangeTransaction = profile.exchangeTransactions().create(transactionStub);

		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus.Finished });

		const exchangeTransactionUpdateMock = vi
			.spyOn(profile.exchangeTransactions(), "update")
			.mockReturnValue(undefined);

		vi.spyOn(profile.exchangeTransactions(), "findById").mockReturnValue(exchangeTransaction);

		const { container } = renderComponent(
			<ExchangeForm orderId={exchangeTransaction.orderId()} onReady={onReady} />,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__confirmation-step")).toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();

		exchangeTransactionUpdateMock.mockRestore();
	});

	const goToReviewStep = async () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		renderComponent(<ExchangeForm onReady={vi.fn()} />)

		await expect(screen.findByTestId("ExchangeForm")).resolves.toBeVisible();

		await selectCurrencies({
			from: { name: "Ark", ticker: "ARK" },
			to: { name: "Bitcoin", ticker: "BTC" },
		});

		const payinInput: HTMLInputElement = screen.getAllByTestId("InputCurrency")[0] as HTMLInputElement;
		const payoutInput: HTMLInputElement = screen.getAllByTestId("InputCurrency")[1] as HTMLInputElement;

		// amount input
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// select recipient
		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(recipientDropdown).not.toBeDisabled();

		await userEvent.type(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		// go to the review step
		await userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		return resetProfileNetworksMock;
	}

	it('should show `Sign` and `Manual Transfer` buttons if from currency is ARK', async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const resetProfileNetworksMock = await goToReviewStep();

		await expect(screen.findByText(t("EXCHANGE.MANUAL_TRANSFER"))).resolves.toBeVisible();
		expect(screen.getByTestId("ExchangeForm__continue-button")).toHaveTextContent(t("COMMON.SIGN"));

		resetProfileNetworksMock();
	});

	it('should proceed to the status step when `Manual Transfer` is clicked', async () => {
		profile.exchangeTransactions().flush();

		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		renderComponent(<ExchangeForm onReady={vi.fn()} />)

		await expect(screen.findByTestId("ExchangeForm")).resolves.toBeVisible();

		await selectCurrencies({
			from: { name: "Ark", ticker: "ARK" },
			to: { name: "Bitcoin", ticker: "BTC" },
		});

		const payinInput: HTMLInputElement = screen.getAllByTestId("InputCurrency")[0] as HTMLInputElement;
		const payoutInput: HTMLInputElement = screen.getAllByTestId("InputCurrency")[1] as HTMLInputElement;

		// amount input
		await userEvent.type(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// select recipient
		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(recipientDropdown).not.toBeDisabled();

		await userEvent.type(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		// go to the review step
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		const exchangeTransaction = profile.exchangeTransactions().create(transactionStub);

		const findTransactionMock = vi
			.spyOn(profile.exchangeTransactions(), "findById")
			.mockReturnValue(exchangeTransaction);

		server.use(
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: {}})
		);

		await expect(screen.findByText(t("EXCHANGE.MANUAL_TRANSFER"))).resolves.toBeVisible();

		expect(screen.getByTestId("ExchangeForm__manual_transfer")).toBeDisabled();

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(screen.getByText(t("EXCHANGE.MANUAL_TRANSFER"))).not.toBeDisabled();
		});

		await userEvent.click(screen.getByText(t("EXCHANGE.MANUAL_TRANSFER")));

		await waitFor(() => {
			statusStep();
		});

		resetProfileNetworksMock();
		findTransactionMock.mockRestore();
	});

	it('should show Sign Transfer modal when `Sign` is clicked', async () => {
		profile.exchangeTransactions().flush();

		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const resetProfileNetworksMock = await goToReviewStep();

		const exchangeTransaction = profile.exchangeTransactions().create(transactionStub);

		const findTransactionMock = vi
			.spyOn(profile.exchangeTransactions(), "findById")
			.mockReturnValue(exchangeTransaction);

		server.use(
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: {}})
		);

		expect(continueButton()).toHaveTextContent(t("COMMON.SIGN"));

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const sendExchangeTransferMock = vi.spyOn(SendExchangeTransfer, "SendExchangeTransfer").mockImplementation(() => {
			return <div>SendExchangeTransfer component</div>
		});

		await userEvent.click(continueButton());

		expect(screen.getByTestId("ExchangeForm__manual_transfer")).toBeDisabled();
		
		await expect(screen.findByText(/SendExchangeTransfer component/)).resolves.toBeVisible();

		resetProfileNetworksMock();
		findTransactionMock.mockRestore();
		sendExchangeTransferMock.mockRestore();
	});

	it('should trigger `onClose`', async () => {
		profile.exchangeTransactions().flush();

		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const resetProfileNetworksMock = await goToReviewStep();

		const exchangeTransaction = profile.exchangeTransactions().create(transactionStub);

		const findTransactionMock = vi
			.spyOn(profile.exchangeTransactions(), "findById")
			.mockReturnValue(exchangeTransaction);

		server.use(
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: {}})
		);

		expect(continueButton()).toHaveTextContent(t("COMMON.SIGN"));

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const sendExchangeTransferMock = vi.spyOn(SendExchangeTransfer, "SendExchangeTransfer").mockImplementation(({onClose}) => {
			return <div>
					<button onClick={onClose} data-testid="Close_SendExchangeTransfer">Close</button>
					SendExchangeTransfer component
				</div>
		});

		await userEvent.click(continueButton());

		await expect(screen.findByText(/SendExchangeTransfer component/)).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("Close_SendExchangeTransfer"));

		await waitFor(() => {
			expect(screen.queryByText(/SendExchangeTransfer component/)).not.toBeInTheDocument();
		})

		resetProfileNetworksMock();
		findTransactionMock.mockRestore();
		sendExchangeTransferMock.mockRestore();
	});

	it('should trigger `onSuccess`', async () => {
		profile.exchangeTransactions().flush();

		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const resetProfileNetworksMock = await goToReviewStep();

		const exchangeTransaction = profile.exchangeTransactions().create(transactionStub);

		const findTransactionMock = vi
			.spyOn(profile.exchangeTransactions(), "findById")
			.mockReturnValue(exchangeTransaction);

		server.use(
			requestMockOnce(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: {}})
		);

		expect(continueButton()).toHaveTextContent(t("COMMON.SIGN"));

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const sendExchangeTransferMock = vi.spyOn(SendExchangeTransfer, "SendExchangeTransfer").mockImplementation(({onSuccess}) => {
			return <div>
				<button onClick={onSuccess} data-testid="Success_SendExchangeTransfer">Success</button>
				SendExchangeTransfer component
			</div>
		});

		await userEvent.click(continueButton());

		await expect(screen.findByText(/SendExchangeTransfer component/)).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("Success_SendExchangeTransfer"));

		await expect(screen.findByTestId("ExchangeForm__status-step")).resolves.toBeVisible();

		resetProfileNetworksMock();
		findTransactionMock.mockRestore();
		sendExchangeTransferMock.mockRestore();
	});

	it.each(["xs", "lg"])("should render with changelly in (%s)", async (breakpoint) => {
		const onReady = vi.fn();
		queryParametersMock.mockRestore();

		vi.spyOn(useQueryParameters, "useQueryParameters").mockImplementation(() => ({
			get: () => "changelly",
		}));

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>
						<ExchangeForm onReady={onReady} />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			breakpoint,
			{
				history,
				route: exchangeURL,
			},
		);

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});
	});
});

describe("FormStep", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		profile.exchangeTransactions().flush();
	});

	it("should render", async () => {
		const Component = () => {
			const form = useForm({
				mode: "onChange",
			});

			return (
				<FormProvider {...form}>
					<FormStep profile={profile} />
				</FormProvider>
			);
		};

		const { container } = render(
			<ExchangeProvider>
				<Wrapper>
					<Component />
				</Wrapper>
			</ExchangeProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__form-step")).toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();
	});
});

describe("ReviewStep", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		profile.exchangeTransactions().flush();
	});

	it("should render", async () => {
		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fromCurrency: {
						addressExplorerMask: "https://blockchair.com/bitcoin/address/{}?from=changenow",
						coin: "btc",
						hasExternalId: false,
						name: "Bitcoin",
						transactionExplorerMask: "https://blockchair.com/bitcoin/transaction/{}?from=changenow",
					},
					minPayinAmount: 0,
					payinAmount: "1",
					payoutAmount: "1",
					recipientWallet: "AYx3T2He3Ubz7H5pycQNG2Cvn6HYzeiC73",
					toCurrency: {
						addressExplorerMask: "https://live.arkscan.io/wallets/{}",
						coin: "ark",
						hasExternalId: false,
						name: "Ark",
						transactionExplorerMask: "https://live.arkscan.io/transaction/{}",
					},
				},
				mode: "onChange",
			}),
		);

		const { container } = render(
			<ExchangeProvider>
				<Wrapper>
					<FormProvider {...form.current}>
						<ReviewStep />
					</FormProvider>
				</Wrapper>
			</ExchangeProvider>,
		);

		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();
	});
});

describe("StatusStep", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		profile.exchangeTransactions().flush();
	});

	it("should render", async () => {
		const exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "payinAddress",
				amount: 1,
				hash: "payinHash",
				ticker: "btc",
			},
			orderId: "id",
			output: {
				address: "payoutAddress",
				amount: 100,
				hash: "payoutHash",
				ticker: "ark",
			},
			provider: "changenow",
		});

		server.use(mockOrderStatus(exchangeTransaction.orderId(), "new"));

		const { container } = render(
			<ExchangeProvider>
				<Wrapper>
					<StatusStep exchangeTransaction={exchangeTransaction} onUpdate={vi.fn()} />
				</Wrapper>
			</ExchangeProvider>,
		);

		await waitFor(() => {
			statusStep();
		});

		expect(container).toMatchSnapshot();
	});

	it("should execute onUpdate callback on status change", async () => {
		const onUpdate = vi.fn();

		const exchangeTransactionData = {
			input: {
				address: "payinAddress",
				amount: 1,
				hash: "payinHash",
				ticker: "btc",
			},
			output: {
				address: "payoutAddress",
				amount: 1,
				hash: "payoutHash",
				ticker: "ark",
			},
		};

		const exchangeTransaction = profile.exchangeTransactions().create({
			...exchangeTransactionData,
			orderId: "orderId",
			provider: "changenow",
		});

		server.use(mockOrderStatus(exchangeTransaction.orderId(), "sending"));

		render(
			<ExchangeProvider>
				<Wrapper>
					<StatusStep exchangeTransaction={exchangeTransaction} onUpdate={onUpdate} />
				</Wrapper>
			</ExchangeProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__status-step")).toBeInTheDocument();
		});

		// status: awaiting confirmation
		await waitFor(() => {
			expect(screen.queryByTestId("StatusIcon__check-mark")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("StatusIcon__spinner")).toHaveLength(1);
		expect(screen.getAllByTestId("StatusIcon__empty")).toHaveLength(2);

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalledWith(exchangeTransaction.id(), {
				...exchangeTransactionData,
				status: expect.any(Number),
			});
		});
	});
});

describe("ConfirmationStep", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		profile.exchangeTransactions().flush();
	});

	it("should render", async () => {
		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fromCurrency: {
						addressExplorerMask: "https://blockchair.com/bitcoin/address/{}",
						coin: "btc",
						hasExternalId: false,
						name: "Bitcoin",
						transactionExplorerMask: "https://blockchair.com/bitcoin/transaction/{}",
					},
				},
				mode: "onChange",
			}),
		);

		const exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "payinAddress",
				amount: 1,
				hash: "payinHash",
				ticker: "btc",
			},
			orderId: "id",
			output: {
				address: "payoutAddress",
				amount: 100,
				ticker: "ark",
			},
			provider: "changenow",
		});

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Finished);

		const { container } = render(
			<ExchangeProvider>
				<Wrapper>
					<FormProvider {...form.current}>
						<ConfirmationStep exchangeTransaction={exchangeTransaction} />
					</FormProvider>
				</Wrapper>
			</ExchangeProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__confirmation-step")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("ExplorerLink")).toHaveLength(2);
		});

		expect(container).toMatchSnapshot();
	});

	it("should not render without exchange transaction", async () => {
		const { result: form } = renderHook(() => useForm());

		const { container } = render(
			<FormProvider {...form.current}>
				<ConfirmationStep exchangeTransaction={undefined} />
			</FormProvider>,
		);

		await waitFor(() => {
			expect(screen.queryByTestId("ExchangeForm__confirmation-step")).not.toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();
	});
});
