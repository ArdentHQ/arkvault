import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { HashHistory, createHashHistory } from "history";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Route } from "react-router-dom";

import { ConfirmationStep } from "./ConfirmationStep";
import { ExchangeForm } from "./ExchangeForm";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { StatusStep } from "./StatusStep";
import { env, getDefaultProfileId, render, screen, waitFor, within } from "@/utils/testing-library";
import { ExchangeProvider, useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { httpClient, toasts } from "@/app/services";
import { requestMock, server } from "@/tests/mocks/server";

import currencyEth from "@/tests/fixtures/exchange/changenow/currency-eth.json";
import order from "@/tests/fixtures/exchange/changenow/order.json";
import { vi } from "vitest";

let profile: Contracts.IProfile;

const exchangeBaseURL = "https://exchanges.arkvault.io";
const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view`;
const exchangeETHURL = "/api/changenow/currencies/eth";
let history: HashHistory;

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
	requestMock(`${exchangeBaseURL}/api/changenow/orders/id`, { data: { id: orderId, status } });

const selectCurrencies = async ({ from, to }: { from?: Record<string, string>; to?: Record<string, string> }) => {
	// from currency
	if (from) {
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).not.toBeDisabled();
		});

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toBeInTheDocument());
		userEvent.paste(screen.getAllByTestId("SelectDropdown__input")[0], from.ticker);

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__option--0")[0]).toBeInTheDocument());
		userEvent.click(screen.getAllByTestId("SelectDropdown__option--0")[0]);

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
		userEvent.paste(screen.getAllByTestId("SelectDropdown__input")[1], to.ticker);

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__option--0")[0]).toBeInTheDocument());
		userEvent.click(screen.getAllByTestId("SelectDropdown__option--0")[0]);

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

const refundAddressID = "ExchangeForm__refund-address";
const payoutValue = "37042.3588384";

describe("ExchangeForm", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		history = createHashHistory();
		history.push(exchangeURL);
	});

	afterEach(() => {
		profile.exchangeTransactions().flush();

		httpClient.clearCache();
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

		expect(screen.getByTestId("ExchangeForm__status-step")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should render exchange form with id of finished order", async () => {
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
		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus.Finished });

		const { container } = renderComponent(
			<ExchangeForm orderId={exchangeTransaction.orderId()} onReady={onReady} />,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(onReady).toHaveBeenCalledWith();
		});

		expect(screen.getByTestId("ExchangeForm__confirmation-step")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
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

		const historySpy = vi.spyOn(history, "push").mockImplementation();
		userEvent.click(screen.getByTestId("ExchangeForm__back-button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${getDefaultProfileId()}/exchange`);
		});

		historySpy.mockRestore();
	});

	it("should show an error alert if the selected pair is unavailable", async () => {
		server.use(
			requestMock(`${exchangeBaseURL}${exchangeETHURL}`, currencyEth),
			requestMock(`${exchangeBaseURL}/api/changenow/tickers/btc/eth`, { error: { message: "Unavailable Pair" } }),
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

		userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));
		await waitFor(() => {
			expect(screen.getByTestId(refundAddressID)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__remove-refund-address")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("ExchangeForm__remove-refund-address"));

		await waitFor(() => {
			expect(screen.queryByTestId(refundAddressID)).not.toBeInTheDocument();
		});
	});

	it("should show external id input if supported", async () => {
		const currency = { ...currencyEth };

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
		userEvent.paste(externalInput, "external-id");

		await waitFor(() => {
			expect(externalInput).toHaveValue("external-id");
		});
	});

	it("should show external id input for refund if supported", async () => {
		const currency = { ...currencyEth };

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

		userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));
		await waitFor(() => {
			expect(screen.getByTestId(refundAddressID)).toBeInTheDocument();
		});

		const refundDropdown = screen.getAllByTestId("SelectDropdown__input")[3];

		userEvent.paste(refundDropdown, "payoutAddress");

		await waitFor(() => {
			expect(refundDropdown).toHaveValue("payoutAddress");
		});

		expect(screen.getByTestId("ExchangeForm__refund-external-id")).toBeInTheDocument();

		const refundExternalInput = within(screen.getByTestId("ExchangeForm__refund-external-id")).getByRole("textbox");
		userEvent.paste(refundExternalInput, "refund-external-id");

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

		userEvent.click(screen.getByTestId("ExchangeForm__swap-button"));

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
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// update amount output
		payoutInput.select();
		userEvent.paste(payoutInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue(payoutValue);
		});

		// remove from currency
		userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).not.toHaveValue();
		});

		expect(payinInput).not.toHaveValue();

		await selectCurrencies({
			from: { name: "Bitcoin", ticker: "BTC" },
		});

		expect(payinInput).toHaveValue(payoutValue);
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
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// remove from currency
		userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);

		await waitFor(() => {
			expect(payinInput).not.toHaveValue();
		});

		// remove to currency
		userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);

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
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// remove payin amount
		userEvent.clear(payinInput);

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
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		// remove payout amount
		userEvent.clear(payoutInput);

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
		userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).not.toHaveValue();
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		userEvent.paste(payoutInput, "1");

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
		userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);
		await waitFor(() => {
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).not.toHaveValue();
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		userEvent.paste(payinInput, "1");

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

		userEvent.paste(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const recipientAddress = screen.getByTestId("ExchangeForm__recipient-address");

		await waitFor(() => {
			expect(within(recipientAddress).getAllByTestId("Input__error")).toHaveLength(2);
		});

		// remove to currency
		userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);

		await waitFor(() => {
			expect(within(recipientAddress).queryByTestId("Input__error")).not.toBeInTheDocument();
		});
	});

	it("should clear refund address error when unsetting from currency", async () => {
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
			from: { name: "Ethereum", ticker: "ETH" },
			to: { name: "Bitcoin", ticker: "BTC" },
		});

		userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));

		const refundAddress = screen.getByTestId(refundAddressID);

		expect(refundAddress).toBeVisible();

		const refundDropdown = screen.getAllByTestId("SelectDropdown__input")[3];

		userEvent.paste(refundDropdown, "payoutAddress");

		await waitFor(() => {
			expect(refundDropdown).toHaveValue("payoutAddress");
		});

		await waitFor(() => {
			expect(within(refundAddress).getAllByTestId("Input__error")).toHaveLength(2);
		});

		// remove from currency
		userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);

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

		userEvent.paste(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		// back to form step
		userEvent.click(screen.getByTestId("ExchangeForm__back-button"));
		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__form-step")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		// go to review step
		userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const toastSpy = vi.spyOn(toasts, "error").mockImplementation();

		// submit form
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(t("EXCHANGE.ERROR.GENERIC"));
		});

		toastSpy.mockRestore();
	});

	it("should show an error toast if the provided address is invalid", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		server.use(
			requestMock(`${exchangeBaseURL}/api/changenow/orders`, { error: { message: "Invalid Address" } }, { method: "post", status: 422 }),
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

		userEvent.paste(recipientDropdown, "payoutAddress");

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		// amount input
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const toastSpy = vi.spyOn(toasts, "error").mockImplementation();

		// submit form
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(t("EXCHANGE.ERROR.INVALID_ADDRESS", { ticker: "ARK" }));
		});

		toastSpy.mockRestore();
	});

	it("should show an error toast if the provided refund address is invalid", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		server.use(
			requestMock(`${exchangeBaseURL}/api/changenow/orders`, { error: { message: "Invalid Refund Address" } }, { method: "post", status: 422 }),
			requestMock(`${exchangeBaseURL}/api/changenow/currencies/btc/refundAddress`, { data: true }),
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

		userEvent.paste(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("ExchangeForm__add-refund-address"));
		await waitFor(() => {
			expect(screen.getByTestId(refundAddressID)).toBeInTheDocument();
		});

		const refundInput = within(screen.getByTestId(refundAddressID)).getByTestId("SelectDropdown__input");
		userEvent.paste(refundInput, "refundAddress");

		await waitFor(() => {
			expect(refundInput).toHaveValue("refundAddress");
		});

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		const toastSpy = vi.spyOn(toasts, "error").mockImplementation();

		// submit form
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(t("EXCHANGE.ERROR.INVALID_REFUND_ADDRESS", { ticker: "BTC" }));
		});

		toastSpy.mockRestore();
	});

	it("should perform an exchange", async () => {
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
			requestMock(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: baseStatus }, { method: "post", modifier: "once" }),
			requestMock(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: { ...baseStatus, status: "exchanging" } }, { method: "post", modifier: "once" }),
			requestMock(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, { data: { ...baseStatus, status: "sending" } }, { method: "post", modifier: "once" }),
			requestMock(`${exchangeBaseURL}/api/changenow/orders/182b657b2c259b`, {
				data: {
					...baseStatus,
					payinHash: "payinHash",
					payoutHash: "payoutHash",
					status: "finished",
				},
			}, { method: "post", modifier: "once" }),
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

		userEvent.paste(recipientDropdown, "payoutAddress");

		await waitFor(() => {
			expect(recipientDropdown).toHaveValue("payoutAddress");
		});

		const payinInput = screen.getAllByTestId("InputCurrency")[0];
		const payoutInput = screen.getAllByTestId("InputCurrency")[1];

		// amount input
		userEvent.paste(payinInput, "1");

		await waitFor(() => {
			expect(payinInput).toHaveValue("1");
		});

		await waitFor(() => {
			expect(payoutInput).toHaveValue(payoutValue);
		});

		expect(screen.getByTestId("FormDivider__exchange-rate")).toBeInTheDocument();

		expect(continueButton()).not.toBeDisabled();

		// go to review step
		userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		// back to form step
		userEvent.click(screen.getByTestId("ExchangeForm__back-button"));
		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__form-step")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		// go to review step
		userEvent.click(continueButton());
		await waitFor(() => {
			expect(reviewStep()).toBeInTheDocument();
		});

		expect(continueButton()).toBeDisabled();

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		// submit form
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__status-step")).toBeInTheDocument();
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

		const historySpy = vi.spyOn(history, "push").mockImplementation();

		await expect(
			screen.findByTestId("ExchangeForm__finish-button", undefined, { timeout: 4000 }),
		).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ExchangeForm__finish-button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${getDefaultProfileId()}/dashboard`);
		});

		historySpy.mockRestore();
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
			expect(screen.getByTestId("ExchangeForm__status-step")).toBeInTheDocument();
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
