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

const TransferType = ({ isSingle, onChange, maxRecipients }: ToggleButtonProperties) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center space-x-2">
			<Switch
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
				<div className="questionmark bg-theme-primary-100 text-theme-primary-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 hover:bg-theme-primary-700 dim:bg-theme-dim-700 dim:text-theme-dim-50 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full hover:text-white">
					<Icon name="QuestionMarkSmall" size="sm" />
				</div>
			</Tooltip>
		</div>
	);
};

export const AddRecipient = ({
	disableMultiPaymentOption,
	onChange,
	profile,
	recipients = [],
	showMultiPaymentOption = true,
	wallet,
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
	const { network, senderAddress, recipientAddress, amount, recipientAlias, isSendAllSelected } = watch();
	const { sendTransfer } = useValidation();

	const ticker = network?.ticker();
	const exchangeTicker = profile.settings().get(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	const maxRecipients = network?.multiPaymentRecipients() ?? 0;

	const remainingBalance = useMemo(() => {
		let senderBalance = BigNumber.make(wallet?.balance() || 0);

		if (isSingle) {
			return senderBalance.toString();
		}

		for (const recipient of addedRecipients) {
			senderBalance = senderBalance.minus(BigNumber.make(recipient.amount || 0));
		}

		return senderBalance.toString();
	}, [addedRecipients, wallet, isSingle]);

	const isSenderFilled = useMemo(() => !!network?.id() && !!senderAddress, [network, senderAddress]);

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
		const remaining = +remainingBalance <= 0 ? 0 : remainingBalance;

		setValue("remainingBalance", remaining);
	}, [remainingBalance, setValue, amount, recipientAddress, senderAddress]);

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

		setValue("amount", remainingBalance, {
			shouldDirty: true,
			shouldValidate: true,
		});

		singleRecipientOnChange({
			address: recipientAddress,
			alias: recipientAlias,
			amount: remainingBalance,
		});
	}, [isSendAllSelected, remainingBalance, setValue]);

	const singleRecipientOnChange = ({
		address,
		alias,
		amount,
	}: {
		address: string | undefined;
		alias?: WalletAliasResult;
		amount: string | number | undefined;
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
				amount: +amount,
			},
		]);
	};

	const handleAddRecipient = () => {
		const amount = getValues("amount");

		const newRecipient: RecipientItem = {
			address: recipientAddress,
			alias: recipientAlias?.alias,
			amount: +amount,
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
							className="whitespace-no-break text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold"
						/>
					),
				},
			}
			: undefined;

	return (
		<AddRecipientWrapper>
			<div className="text-theme-secondary-text hover:text-theme-primary-600 dim:text-theme-dim-200 mb-2 flex items-center justify-between">
				<div className="text-sm font-semibold transition-colors duration-100">{t("TRANSACTION.RECIPIENT")}</div>

				{showMultiPaymentOption && (
					<TransferType
						maxRecipients={maxRecipients}
						isSingle={isSingle}
						disableMultiple={disableMultiPaymentOption}
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

					<FormField name="amount">
						<FormLabel>
							<span className="items-centers flex w-full justify-between">
								<div className="flex flex-row items-center gap-1.5">
									<span>{t("COMMON.AMOUNT")}</span>
									<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm sm:hidden">
										(<Amount value={+remainingBalance} ticker={ticker} showTicker={false} />)
									</span>
								</div>
								<div className="flex flex-row items-center gap-2">
									{isSenderFilled && !!remainingBalance && (
										<div
											data-testid="AddRecipient__available"
											className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 hidden sm:flex"
										>
											<span className="hidden pr-1 sm:inline">{t("COMMON.BALANCE")}:</span>
											<Amount value={+remainingBalance} ticker={ticker} showTicker={true} />
										</div>
									)}
									{isSenderFilled && !!remainingBalance && isSingle && (
										<div
											className="bg-theme-secondary-300 dark:bg-theme-dark-700 dim:bg-theme-dim-700 hidden h-3 w-px sm:flex"
											data-testid="AddRecipient__divider"
										/>
									)}
									{isSingle && (
										<span className="inline-flex">
											<Button
												type="button"
												variant="transparent"
												disabled={!isSenderFilled}
												className="text-theme-navy-600 dim:text-theme-dim-navy-600 p-0 text-sm"
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

						<div className="flex space-x-2">
							<div className="flex-1">
								<InputCurrency
									network={network}
									disabled={!isSenderFilled}
									data-testid="AddRecipient__amount"
									placeholder={t("COMMON.AMOUNT_PLACEHOLDER")}
									value={getValues("amount")}
									addons={amountAddons}
									onChange={(amount: string) => {
										setValue("isSendAllSelected", false);
										setValue("amount", amount, { shouldDirty: true, shouldValidate: true });
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
