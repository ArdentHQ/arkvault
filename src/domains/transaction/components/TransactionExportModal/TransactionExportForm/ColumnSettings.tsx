import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Toggle } from "@/app/components/Toggle";
import { ListDivided } from "@/app/components/ListDivided";

export const ColumnSettings = ({ showFiatColumn }: { showFiatColumn: boolean }) => {
	const { t } = useTranslation();

	const form = useFormContext();
	const { setValue, watch } = form;

	const columnToggles = [
		{
			label: t("TRANSACTION.EXPORT.FORM.TRANSACTION_ID"),
			value: (
				<Toggle
					checked={!!watch("includeTransactionId")}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setValue("includeTransactionId", event.target.checked, {
							shouldDirty: true,
							shouldValidate: true,
						});
					}}
					data-testid="TransactionExportForm__toggle-include-tx-id"
				/>
			),
			wrapperClass: "pb-4",
		},
		{
			label: t("TRANSACTION.EXPORT.FORM.TRANSACTION_DATE"),
			value: (
				<Toggle
					checked={!!watch("includeDate")}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setValue("includeDate", event.target.checked, {
							shouldDirty: true,
							shouldValidate: true,
						});
					}}
					data-testid="TransactionExportForm__toggle-include-date"
				/>
			),
			wrapperClass: "py-4",
		},
		{
			label: t("TRANSACTION.EXPORT.FORM.SENDER_RECIPIENT"),
			value: (
				<Toggle
					checked={!!watch("includeSenderRecipient")}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setValue("includeSenderRecipient", event.target.checked, {
							shouldDirty: true,
							shouldValidate: true,
						});
					}}
					data-testid="TransactionExportForm__toggle-include-sender-recipient"
				/>
			),
			wrapperClass: "py-4",
		},
		{
			label: t("TRANSACTION.EXPORT.FORM.CRYPTO_AMOUNT"),
			value: (
				<Toggle
					checked={!!watch("includeCryptoAmount")}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setValue("includeCryptoAmount", event.target.checked, {
							shouldDirty: true,
							shouldValidate: true,
						});
					}}
					data-testid="TransactionExportForm__toggle-include-crypto-amount"
				/>
			),
			wrapperClass: showFiatColumn ? "py-4" : "pt-4",
		},
	];

	if (showFiatColumn) {
		columnToggles.push({
			label: t("TRANSACTION.EXPORT.FORM.FIAT_AMOUNT"),
			value: (
				<Toggle
					checked={!!watch("includeFiatAmount")}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setValue("includeFiatAmount", event.target.checked, {
							shouldDirty: true,
							shouldValidate: true,
						});
					}}
					data-testid="TransactionExportForm__toggle-include-fiat-amount"
				/>
			),
			wrapperClass: "pt-4",
		});
	}

	return (
		<>
			<div className="mt-8 mb-4 text-lg font-semibold">{t("TRANSACTION.EXPORT.FORM.COLUMNS")}</div>

			<ListDivided items={columnToggles} />
		</>
	);
};
