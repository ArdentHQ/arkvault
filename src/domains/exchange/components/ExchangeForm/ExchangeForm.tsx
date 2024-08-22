import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { ConfirmationStep } from "./ConfirmationStep";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { StatusStep } from "./StatusStep";
import { Button } from "@/app/components/Button";
import { Form } from "@/app/components/Form";
import { FormButtons } from "@/app/components/Form/FormButtons";
import { StepIndicator } from "@/app/components/StepIndicator";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext, useNavigationContext } from "@/app/contexts";
import { useActiveProfile, useQueryParameters, useValidation } from "@/app/hooks";
import { toasts } from "@/app/services";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { CurrencyData, ExchangeFormState, Order } from "@/domains/exchange/exchange.contracts";
import {
	assertCurrency,
	assertExchangeService,
	assertExchangeTransaction,
	isInvalidAddressError,
	isInvalidRefundAddressError,
} from "@/domains/exchange/utils";
import { delay } from "@/utils/delay";

enum Step {
	FormStep = 1,
	ReviewStep,
	StatusStep,
	ConfirmationStep,
}
const ExchangeForm = ({ orderId, onReady }: { orderId?: string; onReady: () => void }) => {
	const { t } = useTranslation();

	const [isFinished, setIsFinished] = useState(false);

	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();
	const { exchangeService, provider } = useExchangeContext();
	const { exchangeOrder } = useValidation();
	const history = useHistory();

	assertExchangeService(exchangeService);

	const [exchangeTransaction, setExchangeTransaction] = useState<Contracts.IExchangeTransaction | undefined>();
	const [activeTab, setActiveTab] = useState<Step>(Step.ReviewStep);

	const form = useForm<ExchangeFormState>({
		defaultValues: {
			"currencies": [
				{
					"coin": "ark",
					"name": "Ark",
					"image": "https://content-api.changenow.io/uploads/ark_fd200b9b4a.svg"
				},
				{
					"coin": "btc",
					"name": "Bitcoin",
					"image": "https://content-api.changenow.io/uploads/btc_1_527dc9ec3c.svg"
				},
			],
			"payinAmount": 176528.6332576,
			"payoutAmount": 0.9052558,
			"recipientWallet": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
			"fromCurrency": {
				"coin": "ark",
				"name": "Ark",
				"image": "https://content-api.changenow.io/uploads/ark_fd200b9b4a.svg",
				"warnings": {
					"to": "",
					"from": ""
				},
				"hasExternalId": false,
				"externalIdName": null,
				"addressExplorerMask": "https://explorer.ark.io/wallets/{}",
				"transactionExplorerMask": "https://explorer.ark.io/transaction/{}"
			},
			"toCurrency": {
				"coin": "btc",
				"name": "Bitcoin",
				"image": "https://content-api.changenow.io/uploads/btc_1_527dc9ec3c.svg",
				"warnings": {
					"to": "",
					"from": ""
				},
				"hasExternalId": false,
				"externalIdName": null,
				"addressExplorerMask": "https://blockchair.com/bitcoin/address/{}",
				"transactionExplorerMask": "https://blockchair.com/bitcoin/transaction/{}"
			},
			"minPayinAmount": 18.9372322,
			"minPayoutAmount": 0.000105,
			"exchangeRate": "0.00000513",
			"estimatedTime": "10-60"
		},
		mode: "onChange",
	});

	const { clearErrors, formState, getValues, handleSubmit, register, trigger, setValue, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { currencies, fromCurrency, toCurrency, minPayinAmount, minPayoutAmount, recipientWallet, refundWallet } =
		watch();
	const queryParameters = useQueryParameters();

	useEffect(() => {
		const fetchCurrencies = async () => {
			try {
				const currencies = await exchangeService.currencies();

				const ark = currencies.filter((currency: CurrencyData) => currency.coin === "ark");
				const eth = currencies.filter((currency: CurrencyData) => currency.coin === "eth");
				const btc = currencies.filter((currency: CurrencyData) => currency.coin === "btc");

				const rest = currencies.filter(
					(currency: CurrencyData) =>
						currency.coin !== "ark" && currency.coin !== "eth" && currency.coin !== "btc",
				);

				if (provider?.slug !== queryParameters.get("exchangeId")) {
					return;
				}

				setValue("currencies", [...ark, ...btc, ...eth, ...rest]);
			} catch {
				//
			}
		};

		fetchCurrencies();
	}, [provider]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const initExchangeTransaction = async () => {
			if (currencies && provider) {
				const transaction = activeProfile
					.exchangeTransactions()
					.values()
					.find((order) => order.orderId() === orderId && order.provider() === provider.slug);

				assertExchangeTransaction(transaction);

				setExchangeTransaction(transaction);
				setActiveTab(transaction.isFinished() ? Step.ConfirmationStep : Step.StatusStep);

				let extendedCurrency: any;

				const fromCurrency = currencies.find(({ coin }: any) => coin === transaction.input().ticker);

				assertCurrency(fromCurrency);

				extendedCurrency = await exchangeService.currency(fromCurrency.coin);
				setValue("fromCurrency", { ...fromCurrency, ...extendedCurrency });

				const toCurrency = currencies.find(({ coin }: any) => coin === transaction.output().ticker);

				assertCurrency(toCurrency);

				extendedCurrency = await exchangeService.currency(toCurrency.coin);
				setValue("toCurrency", { ...toCurrency, ...extendedCurrency });

				onReady();
			}
		};

		if (orderId) {
			initExchangeTransaction();
		} else {
			onReady();
		}
	}, [activeProfile, currencies, exchangeService, exchangeTransaction, orderId, provider, setValue, onReady]);

	useEffect(() => {
		register("currencies");

		register("payinAmount", exchangeOrder.payinAmount(minPayinAmount, fromCurrency?.coin.toUpperCase()));
		register("payoutAmount", exchangeOrder.payoutAmount(minPayoutAmount, toCurrency?.coin.toUpperCase()));
		register("recipientWallet", exchangeOrder.recipientWallet(exchangeService, toCurrency?.coin));
		register("refundWallet", exchangeOrder.refundWallet(exchangeService, fromCurrency?.coin));

		register("externalId");
		register("refundExternalId");

		register("fromCurrency", exchangeOrder.fromCurrency());
		register("toCurrency", exchangeOrder.toCurrency());

		register("minPayinAmount");
		register("minPayoutAmount");
		register("exchangeRate");

		register("estimatedTime");

		if (recipientWallet) {
			if (toCurrency) {
				trigger("recipientWallet");
			} else {
				clearErrors("recipientWallet");
			}
		}

		if (refundWallet) {
			if (fromCurrency) {
				trigger("refundWallet");
			} else {
				clearErrors("refundWallet");
			}
		}
	}, [
		clearErrors,
		exchangeOrder,
		exchangeService,
		fromCurrency,
		minPayinAmount,
		minPayoutAmount,
		recipientWallet,
		refundWallet,
		register,
		t,
		toCurrency,
		trigger,
	]);

	const submitForm = useCallback(async () => {
		const { fromCurrency, toCurrency, recipientWallet, refundWallet, payinAmount, externalId, refundExternalId } =
			getValues();

		const orderParameters: Order = {
			address: recipientWallet,
			amount: +payinAmount,
			from: fromCurrency?.coin,
			to: toCurrency?.coin,
		};

		if (refundWallet) {
			orderParameters.refundAddress = refundWallet;
		}

		/* istanbul ignore next -- @preserve */
		if (toCurrency?.hasExternalId && externalId) {
			orderParameters.externalId = externalId;

			if (refundExternalId) {
				orderParameters.refundExternalId = refundExternalId;
			}
		}

		const order = await exchangeService.createOrder(orderParameters);

		const exchangeTransaction = activeProfile.exchangeTransactions().create({
			input: {
				address: order.payinAddress,
				amount: order.amountFrom,
				ticker: order.from,
			},
			orderId: order.id,
			output: {
				address: order.payoutAddress,
				amount: order.amountTo,
				ticker: order.to,
			},
			provider: provider!.slug,
		});

		await persist();

		setExchangeTransaction(exchangeTransaction);
	}, [activeProfile, exchangeService, getValues, persist, provider]);

	const handleBack = () => {
		if (activeTab === Step.FormStep) {
			history.push(`/profiles/${activeProfile.id()}/exchange`);
		}

		setActiveTab((previous) => previous - 1);
	};

	const handleNext = useCallback(async () => {
		const newIndex = activeTab + 1;

		if (newIndex === Step.StatusStep) {
			try {
				await handleSubmit(submitForm)();
				setActiveTab(newIndex);
			} catch (error) {
				if (isInvalidAddressError(error)) {
					return toasts.error(
						t("EXCHANGE.ERROR.INVALID_ADDRESS", { ticker: toCurrency?.coin.toUpperCase() }),
					);
				}

				if (isInvalidRefundAddressError(error)) {
					return toasts.error(
						t("EXCHANGE.ERROR.INVALID_REFUND_ADDRESS", { ticker: fromCurrency?.coin.toUpperCase() }),
					);
				}

				toasts.error(t("EXCHANGE.ERROR.GENERIC"));
			}

			return;
		}

		setActiveTab(newIndex);
	}, [activeTab, fromCurrency, handleSubmit, submitForm, t, toCurrency]);

	const handleStatusUpdate = useCallback(
		(id: string, parameters: any) => {
			activeProfile.exchangeTransactions().update(id, parameters);

			if (parameters.status === Contracts.ExchangeTransactionStatus.Finished) {
				setIsFinished(true);
			}
		},
		[activeProfile],
	);

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		if (isFinished) {
			timeout = delay(handleNext, 5000);
		}

		return () => clearTimeout(timeout);
	}, [handleNext, isFinished]);

	const showFormButtons = useMemo(
		() => activeTab < Step.StatusStep || activeTab === Step.ConfirmationStep,
		[activeTab],
	);

	const { setHasFixedFormButtons } = useNavigationContext();

	useEffect(() => {
		setHasFixedFormButtons(showFormButtons);
	}, [showFormButtons]);

	return (
		<Form data-testid="ExchangeForm" context={form as any} onSubmit={submitForm}>
			<Tabs activeId={activeTab}>
				<StepIndicator steps={Array.from({ length: 4 })} activeIndex={activeTab} />

				<div className="mt-8">
					<TabPanel tabId={1}>
						<FormStep profile={activeProfile} />
					</TabPanel>

					<TabPanel tabId={2}>
						<ReviewStep />
					</TabPanel>

					<TabPanel tabId={3}>
						<StatusStep exchangeTransaction={exchangeTransaction!} onUpdate={handleStatusUpdate} />
					</TabPanel>

					<TabPanel tabId={4}>
						<ConfirmationStep exchangeTransaction={exchangeTransaction} />
					</TabPanel>

					{showFormButtons && (
						<FormButtons>
							{activeTab < Step.StatusStep && (
								<>
									<Button
										data-testid="ExchangeForm__back-button"
										disabled={isSubmitting}
										variant="secondary"
										onClick={handleBack}
									>
										{t("COMMON.BACK")}
									</Button>

									<Button
										data-testid="ExchangeForm__continue-button"
										disabled={isSubmitting || (isDirty ? !isValid : true)}
										isLoading={isSubmitting}
										onClick={handleNext}
									>
										{t("COMMON.CONTINUE")}
									</Button>
								</>
							)}

							{activeTab === Step.ConfirmationStep && (
								<Button
									data-testid="ExchangeForm__finish-button"
									onClick={() => history.push(`/profiles/${activeProfile.id()}/dashboard`)}
								>
									{t("COMMON.GO_TO_PORTFOLIO")}
								</Button>
							)}
						</FormButtons>
					)}
				</div>
			</Tabs>
		</Form>
	);
};

export { ExchangeForm };
