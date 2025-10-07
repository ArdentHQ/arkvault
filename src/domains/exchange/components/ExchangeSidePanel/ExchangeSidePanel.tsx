import cn from "classnames";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Spinner } from "@/app/components/Spinner";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext, useNavigationContext } from "@/app/contexts";
import { useActiveProfile, useQueryParameters, useValidation } from "@/app/hooks";
import { toasts } from "@/app/services";
import { Contracts } from "@/app/lib/profiles";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import type { Exchange } from "@/domains/exchange/exchange.contracts";
import type { CurrencyData, ExchangeFormState, Order } from "@/domains/exchange/exchange.contracts";
import {
	assertCurrency,
	assertExchangeTransaction,
	isInvalidAddressError,
	isInvalidRefundAddressError,
} from "@/domains/exchange/utils";
import { delay } from "@/utils/delay";
import { shouldUseDarkColors } from "@/utils/theme";
import { SendExchangeTransfer } from "@/domains/exchange/components/SendExchangeTransfer";

import { ConfirmationStep } from "@/domains/exchange/components/ExchangeForm/ConfirmationStep";
import { FormStep } from "@/domains/exchange/components/ExchangeForm/FormStep";
import { ReviewStep } from "@/domains/exchange/components/ExchangeForm/ReviewStep";
import { StatusStep } from "@/domains/exchange/components/ExchangeForm/StatusStep";
import { createPortal } from "react-dom";

enum Step {
	FormStep = 1,
	ReviewStep,
	StatusStep,
	ConfirmationStep,
}

export const ExchangeSidePanel = ({
	onOpenChange,
	exchangeId,
}: {
	onOpenChange: (open: boolean) => void;
	exchangeId: string | undefined;
}) => {
	const queryParameters = useQueryParameters();

	const [logoUrl, setLogoUrl] = useState<string>();
	const [isReady, setIsReady] = useState<boolean>(false);
	const [resetKey, setResetKey] = useState<number>(0);

	const { provider: exchangeProvider, exchangeProviders, setProvider, fetchProviders } = useExchangeContext();

	const queryOrderId = queryParameters.get("orderId");

	// use `orderId` from query string on the very first render
	const orderId = queryOrderId && resetKey === 0 ? queryOrderId : undefined;

	const reset = () => {
		setResetKey(resetKey + 1);
	};

	useEffect(() => {
		if (resetKey === 0) {
			return;
		}

		resetForm();

		setActiveTab(Step.FormStep);

		clearErrors();
	}, [resetKey]);

	useEffect(() => {
		if (!exchangeProviders) {
			fetchProviders();
		}
	}, [exchangeProviders]);

	useEffect(() => {
		const exchange = exchangeProviders?.find((exchange: Exchange) => exchange.slug === exchangeId);

		if (exchange) {
			setProvider(exchange);
		}
	}, [exchangeId, exchangeProviders, setProvider]);

	useLayoutEffect(() => {
		if (exchangeProvider) {
			/* istanbul ignore else -- @preserve */
			if (shouldUseDarkColors()) {
				setLogoUrl(exchangeProvider.logo.dark);
			} else {
				setLogoUrl(exchangeProvider.logo.light);
			}
		}
	}, [exchangeProvider]);

	const totalSteps = 4;

	const { t } = useTranslation();

	const [isFinished, setIsFinished] = useState(false);

	const [showTransferModal, setShowTransferModal] = useState(false);

	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();
	const { exchangeService, provider } = useExchangeContext();
	const { exchangeOrder } = useValidation();

	const [exchangeTransaction, setExchangeTransaction] = useState<Contracts.IExchangeTransaction | undefined>();
	const [transferTransactionId, setTransferTransactionId] = useState<string | undefined>();
	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);

	const form = useForm<ExchangeFormState>({ mode: "onChange" });

	const {
		clearErrors,
		formState,
		getValues,
		handleSubmit,
		register,
		trigger,
		setValue,
		watch,
		reset: resetForm,
	} = form;
	const { isDirty, isSubmitting, isValid, dirtyFields } = formState;

	const { currencies, fromCurrency, toCurrency, minPayinAmount, minPayoutAmount, recipientWallet, refundWallet } =
		watch();

	useEffect(() => {
		if (!exchangeService) {
			return;
		}

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

				if (provider?.slug !== exchangeId) {
					return;
				}

				setValue("currencies", [...ark, ...btc, ...eth, ...rest]);
			} catch {
				//
			}
		};

		fetchCurrencies();
	}, [provider, exchangeService, exchangeId]);

	const onReady = useCallback(() => {
		setIsReady(true);
	}, [setIsReady]);

	const onMountChange = (mounted: boolean) => {
		if (!mounted) {
			reset();
		}
	};

	useEffect(() => {
		if (!exchangeService) {
			return;
		}

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

	useEffect(() => {
		if (!exchangeService) {
			return;
		}

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
			void initExchangeTransaction();
		} else {
			onReady();
		}
	}, [activeProfile, currencies, exchangeService, exchangeTransaction, orderId, provider, setValue, onReady]);

	const mainsailMainnetNetwork = activeProfile
		.availableNetworks()
		.find((network) => network.id() === "mainsail.mainnet");
	const withSignStep = mainsailMainnetNetwork && fromCurrency?.coin.toLowerCase() === "ark";

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

		const order = await exchangeService!.createOrder(orderParameters);

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
			onOpenChange(false);
			return;
		}

		setActiveTab((previous) => previous - 1);
	};

	const handleNext = useCallback(
		async ({ bypassSignStep = false }: { bypassSignStep?: boolean } = {}) => {
			const newIndex = activeTab + 1;

			if (newIndex === Step.StatusStep) {
				try {
					await handleSubmit(submitForm)();

					if (withSignStep && !bypassSignStep) {
						setShowTransferModal(true);
					} else {
						setActiveTab(newIndex);
					}
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
		},
		[withSignStep, activeTab, fromCurrency, handleSubmit, submitForm, t, toCurrency],
	);

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

		if (isFinished && activeTab !== Step.ConfirmationStep) {
			timeout = delay(handleNext, 5000);
		}

		return () => clearTimeout(timeout);
	}, [handleNext, isFinished, activeTab]);

	const showFormButtons = useMemo(
		() => activeTab < Step.StatusStep || activeTab === Step.ConfirmationStep,
		[activeTab],
	);

	const showSignButtons = activeTab === Step.ReviewStep && withSignStep;

	const { setHasFixedFormButtons } = useNavigationContext();

	useEffect(() => {
		setHasFixedFormButtons(showFormButtons);
	}, [showFormButtons]);

	const preventAccidentalClosing = useMemo<boolean>(
		() =>
			activeTab > Step.FormStep ||
			dirtyFields.fromCurrency !== undefined ||
			dirtyFields.toCurrency !== undefined ||
			dirtyFields.payinAmount !== undefined ||
			dirtyFields.payoutAmount !== undefined,
		[
			activeTab,
			dirtyFields.fromCurrency,
			dirtyFields.toCurrency,
			dirtyFields.payinAmount,
			dirtyFields.payoutAmount,
		],
	);

	if (!exchangeService) {
		return <></>;
	}

	const isLastStep = activeTab === Step.ConfirmationStep;

	return (
		<SidePanel
			minimizeable={!isLastStep}
			open={exchangeId !== undefined}
			onOpenChange={onOpenChange}
			onMountChange={onMountChange}
			title={
				<div className="flex items-center">
					<span>{t("COMMON.EXCHANGE_VIA")}</span>
					{logoUrl && (
						<img
							src={logoUrl}
							alt={`${exchangeProvider?.name} Header Logo`}
							className={cn("h-[21px] w-auto", {
								"ml-0": exchangeId === "changenow",
								"ml-3": exchangeId !== "changenow",
							})}
						/>
					)}
				</div>
			}
			subtitle={undefined}
			titleIcon={undefined}
			dataTestId="ExchangeSidePanel"
			hasSteps
			totalSteps={totalSteps}
			activeStep={activeTab}
			onBack={handleBack}
			isLastStep={isLastStep}
			disableOutsidePress={preventAccidentalClosing}
			disableEscapeKey={preventAccidentalClosing}
			shakeWhenClosing={preventAccidentalClosing}
			footer={
				activeTab !== Step.StatusStep && (
					<SidePanelButtons>
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
									onClick={() => handleNext()}
								>
									{showSignButtons ? t("COMMON.SIGN") : t("COMMON.CONTINUE")}
								</Button>
							</>
						)}

						{isLastStep && (
							<div className="flex w-full flex-col gap-3 sm:flex-row-reverse">
								<Button data-testid="ExchangeForm__finish-button" onClick={() => onOpenChange(false)}>
									{t("COMMON.CLOSE")}
								</Button>

								<Button
									data-testid="ExchangeForm__new-exchange"
									variant="secondary"
									onClick={() => reset()}
								>
									{t("EXCHANGE.NEW_EXCHANGE")}
								</Button>
							</div>
						)}
					</SidePanelButtons>
				)
			}
		>
			<div>
				{!exchangeProviders || (exchangeProvider !== undefined && !isReady) ? (
					<div className="py-32">
						<Spinner size="lg" />
					</div>
				) : (
					<>
						<Form data-testid="ExchangeForm" context={form as any} onSubmit={submitForm}>
							<Tabs activeId={activeTab}>
								<div>
									<TabPanel tabId={Step.FormStep}>
										<FormStep profile={activeProfile} />
									</TabPanel>

									<TabPanel tabId={Step.ReviewStep}>
										<ReviewStep
											withSignStep={withSignStep ?? false}
											onManualTransfer={() => handleNext({ bypassSignStep: true })}
										/>
									</TabPanel>

									<TabPanel tabId={Step.StatusStep}>
										<StatusStep
											exchangeTransaction={exchangeTransaction!}
											onUpdate={handleStatusUpdate}
											transferTransactionId={transferTransactionId}
										/>
									</TabPanel>

									<TabPanel tabId={Step.ConfirmationStep}>
										<ConfirmationStep
											exchangeName={exchangeProvider?.name}
											exchangeTransaction={exchangeTransaction}
											profile={activeProfile}
										/>
									</TabPanel>
								</div>
							</Tabs>
						</Form>
						{showTransferModal &&
							exchangeTransaction &&
							mainsailMainnetNetwork &&
							createPortal(
								<SendExchangeTransfer
									profile={activeProfile}
									network={mainsailMainnetNetwork}
									exchangeTransaction={exchangeTransaction}
									onSuccess={(txId: string) => {
										setTransferTransactionId(txId);
										setActiveTab(activeTab + 1);
									}}
									onClose={() => setShowTransferModal(false)}
								/>,
								document.body,
							)}
					</>
				)}
			</div>
		</SidePanel>
	);
};
