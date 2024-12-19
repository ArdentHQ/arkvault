import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useCallback, useEffect, useMemo, useRef, useState, VFC } from "react";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddRecipientProperties, ToggleButtonProperties } from "./AddRecipient.contracts";
import { AddRecipientWrapper } from "./AddRecipient.styles";
import { AddRecipientItem } from "./AddRecipientItem";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { FormField, FormLabel, SubForm } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputCurrency } from "@/app/components/Input";
import { Switch } from "@/app/components/Switch";
import { Tooltip } from "@/app/components/Tooltip";
import { useValidation, WalletAliasResult } from "@/app/hooks";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { SelectRecipient } from "@/domains/profile/components/SelectRecipient";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { twMerge } from "tailwind-merge";

const TransferType = ({ isSingle, disableMultiple, onChange, maxRecipients }: ToggleButtonProperties) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center space-x-2">
			<Tooltip
				content={t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.MULTIPLE_UNAVAILBLE")}
				disabled={!disableMultiple}
			>
				<span>
					<Switch
						size="sm"
						disabled={disableMultiple}
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
				</span>
			</Tooltip>

			<Tooltip content={t("TRANSACTION.RECIPIENTS_HELPTEXT", { count: maxRecipients })}>
				<div className="questionmark flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-theme-primary-100 text-theme-primary-600 hover:bg-theme-primary-700 hover:text-white dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
					<Icon name="QuestionMarkSmall" size="sm" />
				</div>
			</Tooltip>
		</div>
	);
};

const InputButtonStyled = ({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		{...props}
		className={twMerge(
			"input-button flex h-full items-center rounded border-2 border-theme-primary-100 px-5 font-semibold text-theme-secondary-700 transition-colors duration-300 hover:border-theme-primary-100 hover:bg-theme-primary-100 hover:text-theme-primary-700 focus:outline-none focus:ring-2 focus:ring-theme-primary-400 disabled:cursor-not-allowed disabled:border disabled:border-theme-secondary-300 disabled:text-theme-secondary-500 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dark:hover:border-theme-secondary-800 dark:hover:bg-theme-secondary-800 dark:hover:text-white disabled:dark:border-theme-secondary-700 disabled:dark:text-theme-secondary-700",
		)}
	/>
);

export const AddRecipient: VFC<AddRecipientProperties> = ({
	disableMultiPaymentOption,
	onChange,
	profile,
	recipients = [],
	showMultiPaymentOption = true,
	wallet,
}) => {
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
	const { network, senderAddress, fee, recipientAddress, amount, recipientAlias, isSendAllSelected } = watch();
	const { sendTransfer } = useValidation();

	const ticker = network?.ticker();
	const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, ticker });

	const maxRecipients = network?.multiPaymentRecipients() ?? 0;

	const remainingBalance = useMemo(() => {
		let senderBalance = wallet?.balance() || 0;

		if (isSingle) {
			return senderBalance;
		}

		for (const recipient of addedRecipients) {
			senderBalance = senderBalance - Number(recipient.amount || 0);
		}

		return senderBalance;
	}, [addedRecipients, wallet, isSingle]);

	const remainingNetBalance = useMemo(() => {
		const netBalance = BigNumber.make(remainingBalance).minus(fee || 0);

		return netBalance.isGreaterThan(0) ? netBalance.toFixed(10) : "0";
	}, [fee, remainingBalance]);

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
		const remaining = remainingBalance <= 0 ? 0 : remainingBalance;

		setValue("remainingBalance", remaining);
	}, [remainingBalance, setValue, amount, recipientAddress, fee, senderAddress]);

	useEffect(() => {
		register("amount", sendTransfer.amount(network, remainingNetBalance, addedRecipients, isSingle));
		register("recipientAddress", sendTransfer.recipientAddress(profile, network, addedRecipients, isSingle));
	}, [register, network, sendTransfer, addedRecipients, isSingle, profile, remainingNetBalance]);

	useEffect(() => {
		if (network && recipientAddress) {
			trigger("recipientAddress");
		}
	}, [network, recipientAddress, trigger]);

	useEffect(() => {
		if (getValues("amount")) {
			trigger("amount");
		}
	}, [fee, senderAddress, getValues, trigger]);

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
	}, [isSingle, clearErrors, clearFields, addedRecipients, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

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

		const remaining = BigNumber.make(remainingBalance).isGreaterThan(fee) ? +remainingNetBalance : remainingBalance;

		setValue("amount", remaining, {
			shouldDirty: true,
			shouldValidate: true,
		});

		singleRecipientOnChange({
			address: recipientAddress,
			alias: recipientAlias,
			amount: remaining,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fee, isSendAllSelected, remainingBalance, remainingNetBalance, setValue]);

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
				isDelegate: alias?.isDelegate,
			},
		]);
	};

	const handleAddRecipient = () => {
		const amount = getValues("amount");

		const newRecipient: RecipientItem = {
			address: recipientAddress,
			alias: recipientAlias?.alias,
			amount: +amount,
			isDelegate: recipientAlias?.isDelegate,
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
		!errors.amount && !errors.fee && isSenderFilled && !wallet?.network().isTest()
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
			<div className="mb-2 flex items-center justify-between text-theme-secondary-text hover:text-theme-primary-600">
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

			<SubForm data-testid="AddRecipient__form-wrapper" noBackground={isSingle} noPadding={isSingle} className="rounded-xl">
				<div className="space-y-4">
					<FormField name="recipientAddress">
						{!isSingle && (
							<FormLabel label={t("COMMON.RECIPIENT_#", { count: addedRecipients.length + 1 })} />
						)}

						<SelectRecipient
							showWalletAvatar={false}
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
								<span>
									<span>{t("COMMON.AMOUNT")}</span>
									{isSenderFilled && !!remainingNetBalance && (
										<span
											data-testid="AddRecipient__available"
											className="ml-1 text-theme-secondary-500"
										>
											(<Amount value={+remainingNetBalance} ticker={ticker} showTicker={false} />)
										</span>
									)}
								</span>
								{isSingle && (
									<span className="inline-flex sm:hidden">
										<Button
											type="button"
											variant="transparent"
											disabled={!isSenderFilled}
											className="p-0 text-sm text-theme-navy-600"
											onClick={() => {
												setValue("isSendAllSelected", !getValues("isSendAllSelected"));
											}}
											data-testid="AddRecipient__send-all_mobile"
										>
											{t("TRANSACTION.SEND_ALL")}
										</Button>
									</span>
								)}
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

							{isSingle && (
								<div className="hidden sm:inline-flex">
									<InputButtonStyled
										type="button"
										disabled={!isSenderFilled}
										className={cn({
											active: getValues("isSendAllSelected"),
										})}
										onClick={() => {
											setValue("isSendAllSelected", !getValues("isSendAllSelected"));
										}}
										data-testid="AddRecipient__send-all"
									>
										{t("TRANSACTION.SEND_ALL")}
									</InputButtonStyled>
								</div>
							)}
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
							className="mt-4 w-full"
							onClick={handleAddRecipient}
						>
							{t("TRANSACTION.ADD_RECIPIENT")}
						</Button>
					)}

					{!isSingle && addedRecipients.length > 0 && (
						<div>
							{addedRecipients.map((recipient, index) => (
								<AddRecipientItem
									index={index}
									key={`${index}-${recipient.address}`}
									recipient={recipient}
									onDelete={handleRemoveRecipient}
									ticker={ticker}
									exchangeTicker={exchangeTicker}
									showExchangeAmount={network.isLive()}
								/>
							))}
						</div>
					)}
				</div>
			</SubForm>
		</AddRecipientWrapper>
	);
};
