import { AddRecipientProperties, ToggleButtonProperties } from "./AddRecipient.contracts";
import { FormField, FormLabel, SubForm } from "@/app/components/Form";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WalletAliasResult, useValidation } from "@/app/hooks";

import { AddRecipientItem } from "./AddRecipientItem";
import { AddRecipientWrapper } from "./AddRecipient.styles";
import { Amount } from "@/app/components/Amount";
import { BigNumber } from "@/app/lib/helpers";
import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";
import { InputCurrency } from "@/app/components/Input";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { SelectRecipient } from "@/domains/profile/components/SelectRecipient";
import { Switch } from "@/app/components/Switch";
import { Tooltip } from "@/app/components/Tooltip";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SelectToken } from "@/domains/tokens/components/SelectToken";
import { Enums } from "@/app/lib/mainsail";
import { useTransferAssets } from "@/domains/transaction/hooks/use-send-transfer-assets";
import { DISPLAY_DECIMALS } from "@/domains/transaction/utils";
import { ContractAddressHint } from "@/domains/transaction/components/ContractAddressHint/ContractAddressHint";

const TransferType = ({ isSingle, onChange, maxRecipients, disableMultiple }: ToggleButtonProperties) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center space-x-2">
			<Switch
				disabled={disableMultiple}
				size="sm"
				value={isSingle}
				onChange={onChange}
				leftOption={{
					label: t("TRANSACTION.SINGLE"),
					value: true,
				}}
				rightOption={{
					label: t("TRANSACTION.MULTIPLE"),
					value: false,
				}}
			/>

			<Tooltip content={t("TRANSACTION.RECIPIENTS_HELPTEXT", { count: maxRecipients })}>
				<div className="questionmark flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-theme-primary-100 text-theme-primary-600 hover:bg-theme-primary-700 hover:text-white dim:bg-theme-dim-700 dim:text-theme-dim-50 dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
					<Icon name="QuestionMarkSmall" size="sm" />
				</div>
			</Tooltip>
		</div>
	);
};

export const AddRecipient = ({
	onChange,
	profile,
	recipients = [],
	wallet,
	onTokenChange,
	tokens = [],
	isTokenTransfer,
}: AddRecipientProperties) => {
	const { t } = useTranslation();
	const [addedRecipients, setAddedRecipients] = useState<RecipientItem[]>([]);
	const [isSingle, setIsSingle] = useState(recipients.length <= 1);
	const isMountedReference = useRef(false);

	const {
		getValues,
		setValue,
		register,
		watch,
		trigger,
		clearErrors,
		formState: { errors },
	} = useFormContext();
	const {
		network,
		senderAddress,
		recipientAddress,
		amount,
		recipientAlias,
		isSendAllSelected,
		tokenContractAddress,
	} = watch();
	const { sendTransfer } = useValidation();
	const selectedAsset = tokenContractAddress;
	const selectedToken = tokens.find((token) => token.token().address() === selectedAsset);

	const ticker = network?.ticker();
	const exchangeTicker = profile.settings().get(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	const maxRecipients = network?.multiPaymentRecipients() ?? 0;

	const remainingBalance = useMemo(() => {
		if (wallet) {
			const token = wallet
				.tokens()
				.values()
				.find((token) => token.token().address() === selectedAsset);

			if (token) {
				return token.balance();
			}

			if (!selectedAsset) {
				return BigNumber.ZERO;
			}
		}

		let senderBalance = BigNumber.make(wallet?.balance() || 0);

		if (isSingle) {
			return senderBalance;
		}

		for (const recipient of addedRecipients) {
			senderBalance = senderBalance.minus(BigNumber.make(recipient.amount || 0));
		}

		return senderBalance;
	}, [addedRecipients, wallet, isSingle, selectedAsset]);

	const isSenderFilled = useMemo(() => !!network?.id() && !!senderAddress, [network, senderAddress]);

	// Force single send when a token is selected.
	useEffect(() => {
		if (selectedToken && !isSingle) {
			setIsSingle(true);
		}
	}, [selectedToken, isSingle]);

	const clearFields = useCallback(() => {
		setValue("amount", undefined);
		setValue("recipientAddress", undefined);
	}, [setValue]);

	useEffect(() => {
		register("remainingBalance");
		register("isSendAllSelected");
		register("recipientAlias");
	}, [register]);

	useEffect(() => {
		setValue("remainingBalance", remainingBalance);
	}, [remainingBalance.toString(), setValue, amount, recipientAddress, senderAddress]);

	useEffect(() => {
		register("amount", sendTransfer.amount(network, remainingBalance, addedRecipients, isSingle));
		register("recipientAddress", sendTransfer.recipientAddress(profile, network, addedRecipients, isSingle));
	}, [register, network, sendTransfer, addedRecipients, isSingle, profile, remainingBalance]);

	useEffect(() => {
		if (network && recipientAddress) {
			trigger("recipientAddress");
		}
	}, [network, recipientAddress, trigger]);

	useEffect(() => {
		if (getValues("amount")) {
			trigger("amount");
		}
	}, [senderAddress, getValues, trigger]);

	useEffect(() => {
		if (!isMountedReference.current) {
			return;
		}

		if (isSingle) {
			if (addedRecipients.length === 1) {
				const { amount, address } = addedRecipients[0];

				setValue("amount", amount);

				setValue("recipientAddress", address);

				singleRecipientOnChange({ address, amount });

				// Clear the fields and update the recipient item(s) when switch between transfer type.
				// This is made to prevent enabling or disabling the "continue" button.
				// If there is no recipients there is no need to clear since it can
				// keep the values from the form field
			} else if (addedRecipients.length > 1) {
				clearFields();
				onChange([]);
			} else {
				singleRecipientOnChange({ address: recipientAddress, alias: recipientAlias, amount });
			}
		} else {
			if (addedRecipients.length > 0) {
				clearFields();
				onChange(addedRecipients);
				return;
			}

			onChange([]);
		}
	}, [isSingle, clearErrors, clearFields, addedRecipients, setValue]);

	useEffect(() => {
		if (!isSingle) {
			setValue("isSendAllSelected", false);
		}
	}, [isSingle, setValue]);

	useEffect(() => {
		if (isMountedReference.current) {
			return;
		}

		if (recipients.length === 0) {
			return;
		}

		setAddedRecipients(recipients);
	}, [recipients, setValue, getValues]);

	useEffect(() => {
		isMountedReference.current = true;
	}, []);

	useEffect(() => {
		if (!isSendAllSelected) {
			return;
		}

		const balance = remainingBalance.toFixed();

		setValue("amount", balance, {
			shouldDirty: true,
			shouldValidate: true,
		});

		singleRecipientOnChange({
			address: recipientAddress,
			alias: recipientAlias,
			amount: balance,
		});
	}, [isSendAllSelected, remainingBalance, setValue]);

	const { assets } = useTransferAssets({ isSingle, profile, tokens });

	const singleRecipientOnChange = ({
		address,
		alias,
		amount,
	}: {
		address: string | undefined;
		alias?: WalletAliasResult;
		amount: string | undefined;
	}) => {
		if (!isSingle) {
			return;
		}

		if (!address || !amount) {
			return onChange([]);
		}

		onChange([
			{
				address,
				alias: alias?.alias,
				amount,
			},
		]);
	};

	const handleAddRecipient = () => {
		const amount = getValues("amount");

		const newRecipient: RecipientItem = {
			address: recipientAddress,
			alias: recipientAlias?.alias,
			amount,
		};

		const newRecipients = [...addedRecipients, newRecipient];

		setAddedRecipients(newRecipients);
		onChange(newRecipients);
		clearFields();
	};

	const handleRemoveRecipient = (index: number) => {
		const remainingRecipients = [...addedRecipients];
		remainingRecipients.splice(index, 1);

		setAddedRecipients(remainingRecipients);
		onChange(remainingRecipients);
	};

	const amountAddons =
		!errors.amount && !errors.gasPrice && !errors.gasLimit && isSenderFilled && !wallet?.network().isTest()
			? {
					end: {
						content: (
							<Amount
								value={convert(amount || 0)}
								ticker={exchangeTicker}
								data-testid="AddRecipient__currency-balance"
								className="whitespace-no-break text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700"
							/>
						),
					},
				}
			: undefined;

	return (
		<AddRecipientWrapper>
			<div className="mb-2 flex items-center justify-between text-theme-secondary-text hover:text-theme-primary-600 dim:text-theme-dim-200">
				<div className="text-sm font-semibold leading-[17px] transition-colors duration-100 sm:text-base sm:leading-5">
					{t("TRANSACTION.RECIPIENT")}
				</div>

				{network?.allows(Enums.FeatureFlag.TransactionMultiPayment) && (
					<TransferType
						maxRecipients={maxRecipients}
						isSingle={isSingle}
						disableMultiple={!!selectedToken || !selectedAsset}
						onChange={(isSingle) => {
							setIsSingle(isSingle);
						}}
					/>
				)}
			</div>

			<SubForm
				data-testid="AddRecipient__form-wrapper"
				noBorder={isSingle}
				noPadding={isSingle}
				className="rounded-xl"
			>
				<div className="space-y-4">
					<div className="space-y-4 sm:space-y-0">
						<FormField name="recipientAddress">
							{!isSingle && (
								<FormLabel label={t("COMMON.RECIPIENT_#", { count: addedRecipients.length + 1 })} />
							)}

							<SelectRecipient
								network={network}
								disabled={!isSenderFilled}
								address={recipientAddress}
								profile={profile}
								onChange={(address, alias) => {
									setValue("recipientAddress", address, { shouldDirty: true, shouldValidate: true });
									setValue("recipientAlias", alias);
									singleRecipientOnChange({
										address,
										alias,
										amount: getValues("amount"),
									});
								}}
							/>
						</FormField>

						<FormField name="asset">
							<div className="relative block space-y-2 sm:hidden">
								<FormLabel>
									<div>{t("COMMON.ASSET")}</div>
								</FormLabel>
								<SelectToken
									value={selectedAsset}
									tokens={assets}
									wallet={wallet}
									onChange={({ value }) => {
										const tokenAddress = value;
										const token = tokens.find((token) => token.token().address() === tokenAddress);

										if (amount) {
											void trigger("amount");
										}

										setValue("tokenContractAddress", tokenAddress, {
											shouldDirty: true,
											shouldValidate: true,
										});

										onTokenChange?.(token);
									}}
								/>
							</div>
						</FormField>
					</div>

					<FormField name="amount">
						<FormLabel>
							<span className="items-centers flex w-full justify-between">
								<div className="flex flex-row items-center gap-1.5">
									<span className="sm:hidden">{t("COMMON.AMOUNT")}</span>
									<span className="hidden text-base leading-5 sm:block">
										{t("COMMON.ASSET_AMOUNT")}
									</span>
									<span className="text-sm text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 sm:hidden">
										(
										<Amount
											value={remainingBalance}
											ticker={ticker}
											showTicker={false}
											showCompactFormat
										/>
										)
									</span>
								</div>
								<div className="flex flex-row items-center gap-2">
									{isSenderFilled && (
										<div
											data-testid="AddRecipient__available"
											className="hidden text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 sm:flex"
										>
											<span className="hidden pr-1 sm:inline">{t("COMMON.BALANCE")}:</span>
											<Amount
												value={remainingBalance.decimalPlaces(DISPLAY_DECIMALS)}
												ticker={ticker}
												showTicker
												showCompactFormat
											/>
										</div>
									)}
									{isSenderFilled && !!remainingBalance && isSingle && (
										<div
											className="hidden h-3 w-px bg-theme-secondary-300 dim:bg-theme-dim-700 dark:bg-theme-dark-700 sm:flex"
											data-testid="AddRecipient__divider"
										/>
									)}
									{isSingle && (
										<span className="inline-flex">
											<Button
												type="button"
												variant="transparent"
												disabled={!isSenderFilled}
												className="p-0 text-sm text-theme-navy-600 underline-offset-4 hover:text-theme-navy-700 hover:underline dim:text-theme-dim-navy-600 dim:hover:text-theme-dim-navy-700 dark:hover:text-theme-dark-navy-500"
												onClick={() => {
													setValue("isSendAllSelected", !getValues("isSendAllSelected"));
												}}
												data-testid="AddRecipient__send-all"
											>
												{t("TRANSACTION.SEND_ALL")}
											</Button>
										</span>
									)}
								</div>
							</span>
						</FormLabel>

						<div className="relative flex">
							<div className="hidden w-full sm:block sm:max-w-44">
								<SelectToken
									wallet={wallet}
									value={selectedAsset}
									tokens={assets}
									className="sm:rounded-r-none sm:border-r-transparent"
									onChange={({ value }) => {
										const tokenAddress = value;
										const token = tokens.find((token) => token.token().address() === tokenAddress);

										if (amount) {
											void trigger("amount");
										}

										setValue("tokenContractAddress", tokenAddress, {
											shouldDirty: true,
											shouldValidate: true,
										});

										onTokenChange?.(token);
									}}
								/>
							</div>
							<div className="flex-1">
								<InputCurrency
									className="sm:rounded-l-none"
									network={network}
									disabled={!isSenderFilled}
									data-testid="AddRecipient__amount"
									placeholder={t("COMMON.AMOUNT_PLACEHOLDER")}
									value={getValues("amount")}
									addons={amountAddons}
									onChange={(amount: string) => {
										setValue("isSendAllSelected", false);

										setValue("amount", amount, {
											shouldDirty: true,
											shouldValidate: !(isTokenTransfer && !selectedAsset),
										});

										singleRecipientOnChange({
											address: recipientAddress,
											alias: recipientAlias,
											amount,
										});
									}}
								/>
							</div>
						</div>
					</FormField>

					{selectedToken && wallet && (
						<ContractAddressHint
							token={selectedToken}
							link={wallet.link().wallet(selectedToken.token().address())}
						/>
					)}

					{!isSingle && (
						<Button
							disabled={
								!!errors.amount ||
								!!errors.recipientAddress ||
								!getValues("amount") ||
								!getValues("recipientAddress") ||
								addedRecipients.length >= maxRecipients
							}
							data-testid="AddRecipient__add-button"
							variant="secondary"
							className="w-full"
							onClick={handleAddRecipient}
						>
							{t("TRANSACTION.ADD_RECIPIENT")}
						</Button>
					)}

					{!isSingle && addedRecipients.length > 0 && (
						<div className="space-y-0 sm:space-y-1">
							{addedRecipients.map((recipient, index) => (
								<AddRecipientItem
									index={index}
									key={`${index}-${recipient.address}`}
									recipient={recipient}
									onDelete={handleRemoveRecipient}
									ticker={ticker}
									exchangeTicker={exchangeTicker}
									showExchangeAmount={network.isLive()}
									profile={profile}
								/>
							))}
						</div>
					)}
				</div>
			</SubForm>
		</AddRecipientWrapper>
	);
};
