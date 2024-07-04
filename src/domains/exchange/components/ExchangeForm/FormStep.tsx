import cn from "classnames";
import { Networks } from "@ardenthq/sdk";
import { startCase } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { CurrencyIcon, FormDivider } from "./FormStep.blocks";
import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputCurrency, InputDefault } from "@/app/components/Input";
import { OptionProperties, Select } from "@/app/components/SelectDropdown";
import { Spinner } from "@/app/components/Spinner";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { assertExchangeService, isUnavailablePairError } from "@/domains/exchange/utils";
import { SelectRecipient } from "@/domains/profile/components/SelectRecipient";
import { useBreakpoint } from "@/app/hooks";

interface FormStepProperties {
	profile: Contracts.IProfile;
}

export const FormStep = ({ profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const [recipientNetwork, setRecipientNetwork] = useState<Networks.Network | undefined>();
	const [senderNetwork, setSenderNetwork] = useState<Networks.Network | undefined>();

	const [showExternalId, setShowExternalId] = useState(false);
	const [showRefundExternalId, setShowRefundExternalId] = useState(false);

	const [isLoadingPayinAmount, setIsLoadingPayinAmount] = useState(false);
	const [isLoadingPayoutAmount, setIsLoadingPayoutAmount] = useState(false);
	const [showRefundInput, setShowRefundInput] = useState(false);

	const { clearErrors, errors, getValues, setError, setValue, trigger, watch } = useFormContext();
	const { currencies, exchangeRate, fromCurrency, toCurrency, payinAmount, payoutAmount } = watch();

	const { isXs } = useBreakpoint();

	const { exchangeService } = useExchangeContext();
	assertExchangeService(exchangeService);

	const hasCurrencies = !!currencies?.length;

	useEffect(() => {
		const fetchMinAmounts = async () => {
			try {
				let minPayin = 0;
				let minPayout = 0;

				if (fromCurrency && toCurrency) {
					minPayin = await exchangeService.minimalExchangeAmount(fromCurrency.coin, toCurrency.coin);
					minPayout = await exchangeService.minimalExchangeAmount(toCurrency.coin, fromCurrency.coin);
				}

				setValue("minPayinAmount", minPayin);
				setValue("minPayoutAmount", minPayout);

				if (payinAmount) {
					trigger("payinAmount");
				}

				if (payoutAmount) {
					trigger("payoutAmount");
				}

				clearErrors("pair");
			} catch (error) {
				/* istanbul ignore else -- @preserve */
				if (isUnavailablePairError(error)) {
					setError("pair", { type: "manual" });
				}
			}
		};

		fetchMinAmounts();
	}, [
		clearErrors,
		exchangeService,
		fromCurrency,
		toCurrency,
		payinAmount,
		payoutAmount,
		setError,
		setValue,
		trigger,
	]);

	const updateExchangeRate = useCallback(() => {
		const { fromCurrency, toCurrency, payinAmount, payoutAmount } = getValues();

		if (!fromCurrency || !toCurrency || !payoutAmount || !payinAmount) {
			return setValue("exchangeRate", undefined);
		}

		setValue("exchangeRate", (payoutAmount / payinAmount).toFixed(8));
	}, [getValues, setValue]);

	useEffect(() => {
		if (!isLoadingPayinAmount && !isLoadingPayoutAmount) {
			updateExchangeRate();
		}
	}, [
		fromCurrency,
		toCurrency,
		payinAmount,
		payoutAmount,
		updateExchangeRate,
		isLoadingPayinAmount,
		isLoadingPayoutAmount,
	]);

	const currencyOptions = useMemo(
		() =>
			(currencies || []).map(({ coin }: any) => ({
				label: coin.toUpperCase(),
				value: coin.toUpperCase(),
			})),
		[currencies],
	);

	const updateAmounts = async () => {
		const { fromCurrency, toCurrency } = getValues();

		if (!fromCurrency || !toCurrency) {
			return;
		}

		if (payinAmount) {
			await updatePayoutAmount();
		} else if (payoutAmount) {
			await updatePayinAmount();
		}
	};

	const handlePayinAmountChange = async (amount?: string) => {
		setValue("payinAmount", amount, { shouldDirty: true, shouldValidate: true });

		if (fromCurrency && toCurrency) {
			await updatePayoutAmount();
		}
	};

	const handlePayoutAmountChange = async (amount?: string) => {
		setValue("payoutAmount", amount, { shouldDirty: true, shouldValidate: true });

		if (fromCurrency && toCurrency) {
			await updatePayinAmount();
		}
	};

	const handleFromCurrencyChange = async (fromCurrency: any) => {
		const currency = fromCurrency
			? currencies.find(({ coin }: any) => coin === fromCurrency?.label.toLowerCase())
			: undefined;

		if (currency) {
			const extendedCurrency = await exchangeService.currency(currency.coin);
			setValue("fromCurrency", { ...currency, ...extendedCurrency }, { shouldDirty: true, shouldValidate: true });

			setShowRefundExternalId(!!extendedCurrency.hasExternalId);

			await updateAmounts();

			const wallets = profile.wallets().findByCoin(currency.coin.toUpperCase());

			for (const wallet of wallets) {
				/* istanbul ignore if -- @preserve */
				if (wallet.network().isLive()) {
					return setSenderNetwork(wallet.network());
				}
			}

			return setSenderNetwork(undefined);
		}

		if (payinAmount) {
			setValue("payinAmount", undefined, { shouldDirty: true, shouldValidate: true });
		}

		setValue("fromCurrency", undefined, { shouldDirty: true, shouldValidate: true });
	};

	const handleToCurrencyChange = async (toCurrency: any) => {
		const currency = toCurrency
			? currencies.find(({ coin }: any) => coin === toCurrency?.label.toLowerCase())
			: undefined;

		if (currency) {
			const extendedCurrency = await exchangeService.currency(currency.coin);
			setValue("toCurrency", { ...currency, ...extendedCurrency }, { shouldDirty: true, shouldValidate: true });

			setShowExternalId(!!extendedCurrency.hasExternalId);

			await updateAmounts();

			const wallets = profile.wallets().findByCoin(currency.coin.toUpperCase());

			for (const wallet of wallets) {
				/* istanbul ignore if -- @preserve */
				if (wallet.network().isLive()) {
					return setRecipientNetwork(wallet.network());
				}
			}

			return setRecipientNetwork(undefined);
		}

		if (payoutAmount) {
			setValue("payoutAmount", undefined, { shouldDirty: true, shouldValidate: true });
		}

		setValue("toCurrency", undefined, { shouldDirty: true, shouldValidate: true });

		setRecipientNetwork(undefined);
	};

	const fetchEstimate = async (from: string, to: string, amount: number) => {
		try {
			const { estimatedAmount, estimatedTime } = await exchangeService.estimateExchangeAmount(from, to, amount);

			setValue("estimatedTime", estimatedTime);

			return estimatedAmount;
		} catch {
			//
		}
	};

	const updatePayinAmount = async () => {
		const { payoutAmount: amount, fromCurrency, toCurrency } = getValues();

		if (amount) {
			setIsLoadingPayinAmount(true);

			const estimatedAmount = await fetchEstimate(toCurrency?.coin, fromCurrency?.coin, amount);
			setValue("payinAmount", estimatedAmount, { shouldDirty: true, shouldValidate: true });

			setIsLoadingPayinAmount(false);
		} else {
			setValue("payinAmount", undefined, { shouldDirty: true, shouldValidate: true });
		}
	};

	const updatePayoutAmount = async () => {
		const { payinAmount: amount, fromCurrency, toCurrency } = getValues();

		if (amount) {
			setIsLoadingPayoutAmount(true);

			const estimatedAmount = await fetchEstimate(fromCurrency?.coin, toCurrency?.coin, amount);
			setValue("payoutAmount", estimatedAmount, { shouldDirty: true, shouldValidate: true });

			setIsLoadingPayoutAmount(false);
		} else {
			setValue("payoutAmount", undefined, { shouldDirty: true, shouldValidate: true });
		}
	};

	const handleSwapCurrencies = () => {
		const { fromCurrency, toCurrency, payinAmount, payoutAmount } = getValues();

		let temporary = fromCurrency;

		setValue("fromCurrency", toCurrency);
		setValue("toCurrency", temporary);

		temporary = payinAmount;

		setValue("payinAmount", payoutAmount);
		setValue("payoutAmount", temporary);
	};

	const handleRecipientWalletChange = (address: string | undefined) => {
		setValue("recipientWallet", address, { shouldDirty: true, shouldValidate: true });
	};

	const handleRefundWalletChange = (address: string | undefined) => {
		setValue("refundWallet", address, { shouldDirty: true, shouldValidate: true });
	};

	const renderCurrencyLabel = ({ value, isSelected }: OptionProperties) => {
		const currency = currencies.find(({ coin }: any) => coin === (value as string | undefined)?.toLowerCase());

		return (
			<div className="flex w-full flex-col">
				<span
					className={cn("font-semibold", {
						"text-theme-primary-600": isSelected,
					})}
				>
					{currency?.coin?.toUpperCase()}
				</span>
				<span className="dark:theme-text-secondary-700 text-sm text-theme-secondary-500">{currency.name}</span>
			</div>
		);
	};

	const renderRefundToggle = () => {
		if (showRefundInput) {
			return (
				<button
					data-testid="ExchangeForm__remove-refund-address"
					type="button"
					className="link text-sm font-semibold"
					onClick={() => setShowRefundInput(false)}
				>
					{t("EXCHANGE.REFUND_WALLET.REMOVE")}
				</button>
			);
		}

		return (
			<button
				data-testid="ExchangeForm__add-refund-address"
				type="button"
				className="link text-sm font-semibold"
				onClick={() => setShowRefundInput(true)}
			>
				+{t("EXCHANGE.REFUND_WALLET.ADD")}
			</button>
		);
	};

	useEffect(() => {
		if (!showRefundInput) {
			handleRefundWalletChange(undefined);
		}
	}, [showRefundInput]);

	return (
		<div data-testid="ExchangeForm__form-step" className="flex flex-col">
			<div className="relative flex space-x-3">
				<div className="w-1/2 sm:w-2/5">
					<FormField name="fromCurrency">
						<FormLabel label={t("COMMON.CRYPTOASSET")} />
						<Select
							id="fromCurrency"
							disabled={!hasCurrencies}
							defaultValue={fromCurrency?.coin.toUpperCase()}
							placeholder={t("COMMON.SELECT")}
							wrapperClassName="static sm:relative"
							addons={{
								start: {
									content: <CurrencyIcon image={fromCurrency?.image} ticker={fromCurrency?.coin} />,
								},
							}}
							options={
								toCurrency
									? currencyOptions.filter(
											(option: any) => option.value !== toCurrency.coin.toUpperCase(),
										)
									: currencyOptions
							}
							renderLabel={renderCurrencyLabel}
							onChange={handleFromCurrencyChange}
						/>
					</FormField>
				</div>

				<div className="w-1/2 sm:w-3/5">
					<FormField name="payinAmount">
						<FormLabel label={t("EXCHANGE.EXCHANGE_FORM.YOU_SEND")} />
						<InputCurrency
							placeholder={isXs ? t("COMMON.AMOUNT") : t("COMMON.AMOUNT_PLACEHOLDER")}
							value={payinAmount}
							onChange={async (amount: string) => await handlePayinAmountChange(amount)}
							addons={
								isLoadingPayinAmount
									? {
											end: {
												content: <Spinner size="sm" />,
											},
										}
									: undefined
							}
						/>
					</FormField>
				</div>
			</div>

			<FormDivider
				isLoading={isLoadingPayinAmount || isLoadingPayoutAmount}
				exchangeRate={exchangeRate}
				fromCurrency={fromCurrency}
				toCurrency={toCurrency}
				onSwapCurrencies={handleSwapCurrencies}
			/>

			<div className="space-y-6">
				<div className="relative flex space-x-3">
					<div className="w-1/2 sm:w-2/5">
						<FormField name="toCurrency">
							<FormLabel label={t("COMMON.CRYPTOASSET")} />
							<Select
								id="toCurrency"
								disabled={!hasCurrencies}
								defaultValue={toCurrency?.coin.toUpperCase()}
								placeholder={t("COMMON.SELECT")}
								wrapperClassName="static sm:relative"
								addons={{
									start: {
										content: <CurrencyIcon image={toCurrency?.image} ticker={toCurrency?.coin} />,
									},
								}}
								options={
									fromCurrency
										? currencyOptions.filter(
												(option: any) => option.value !== fromCurrency.coin.toUpperCase(),
											)
										: currencyOptions
								}
								renderLabel={renderCurrencyLabel}
								onChange={handleToCurrencyChange}
							/>
						</FormField>
					</div>

					<div className="w-1/2 sm:w-3/5">
						<FormField name="payoutAmount">
							<FormLabel label={t("EXCHANGE.EXCHANGE_FORM.YOU_GET")} />
							<InputCurrency
								placeholder={isXs ? t("COMMON.AMOUNT") : t("COMMON.AMOUNT_PLACEHOLDER")}
								value={payoutAmount}
								onChange={async (amount: string) => await handlePayoutAmountChange(amount)}
								addons={
									isLoadingPayoutAmount
										? {
												end: {
													content: <Spinner size="sm" />,
												},
											}
										: undefined
								}
							/>
						</FormField>
					</div>
				</div>

				<div data-testid="ExchangeForm__recipient-address">
					<FormField name="recipientWallet">
						<FormLabel>
							<div className="flex w-full justify-between">
								{t("EXCHANGE.EXCHANGE_FORM.RECIPIENT_WALLET")}

								{renderRefundToggle()}
							</div>
						</FormLabel>
						<SelectRecipient
							network={recipientNetwork}
							disabled={!getValues("toCurrency")}
							showOptions={!!recipientNetwork}
							address={getValues("recipientWallet") || ""}
							profile={profile}
							placeholder={t("EXCHANGE.EXCHANGE_FORM.RECIPIENT_PLACEHOLDER")}
							onChange={handleRecipientWalletChange}
						/>
					</FormField>
				</div>

				{showExternalId && (
					<div data-testid="ExchangeForm__external-id">
						<FormField name="externalId">
							<FormLabel label={startCase(`${toCurrency.externalIdName}`)} />
							<InputDefault
								onChange={(event: ChangeEvent<HTMLInputElement>) =>
									setValue("externalId", event.target.value, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
							/>
						</FormField>
					</div>
				)}

				{showRefundInput && (
					<div className="space-y-6">
						<div data-testid="ExchangeForm__refund-address">
							<FormField name="refundWallet">
								<FormLabel label={t("EXCHANGE.EXCHANGE_FORM.REFUND_WALLET")} />
								<SelectRecipient
									network={senderNetwork}
									disabled={!getValues("fromCurrency")}
									showOptions={!!senderNetwork}
									address={getValues("refundWallet") || ""}
									profile={profile}
									placeholder={t("EXCHANGE.EXCHANGE_FORM.REFUND_PLACEHOLDER")}
									onChange={handleRefundWalletChange}
								/>
							</FormField>
						</div>

						{showRefundExternalId && (
							<div data-testid="ExchangeForm__refund-external-id">
								<FormField name="refundExternalId">
									<FormLabel label={startCase(`Refund ${toCurrency.externalIdName}`)} />
									<InputDefault
										onChange={(event: ChangeEvent<HTMLInputElement>) =>
											setValue("refundExternalId", event.target.value, {
												shouldDirty: true,
												shouldValidate: true,
											})
										}
									/>
								</FormField>
							</div>
						)}
					</div>
				)}

				{errors.pair && (
					<Alert variant="danger">
						<Trans
							i18nKey="EXCHANGE.VALIDATION.PAIR_NOT_AVAILABLE"
							values={{
								from: fromCurrency?.coin.toUpperCase(),
								to: toCurrency?.coin.toUpperCase(),
							}}
							components={{ bold: <strong /> }}
						/>
					</Alert>
				)}
			</div>
		</div>
	);
};
