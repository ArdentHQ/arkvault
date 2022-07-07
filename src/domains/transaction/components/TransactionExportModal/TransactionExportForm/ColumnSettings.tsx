import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Toggle } from "@/app/components/Toggle";
import { ListDivided } from "@/app/components/ListDivided";

export const ColumnSettings = ({ showFiatColumn }: { showFiatColumn: boolean }) => {
	const { t } = useTranslation();
	const form = useFormContext();

	const columnToggles = [
		{
			label: t("TRANSACTION.EXPORT.FORM.TRANSACTION_ID"),
			value: (
				<Toggle
					ref={form.register()}
					name="includeTransactionId"
					defaultChecked={!!form.getValues("includeTransactionId")}
					data-testid="TransactionExportForm__toggle-include-tx-id"
				/>
			),
			wrapperClass: "pb-4",
		},
		{
			label: t("TRANSACTION.EXPORT.FORM.TRANSACTION_DATE"),
			value: (
				<Toggle
					ref={form.register()}
					name="includeDate"
					defaultChecked={!!form.getValues("includeDate")}
					data-testid="TransactionExportForm__toggle-include-date"
				/>
			),
			wrapperClass: "py-4",
		},
		{
			label: t("TRANSACTION.EXPORT.FORM.SENDER_RECIPIENT"),
			value: (
				<Toggle
					ref={form.register()}
					name="includeSenderRecipient"
					defaultChecked={!!form.getValues("includeSenderRecipient")}
					data-testid="TransactionExportForm__toggle-include-sender-recipient"
				/>
			),
			wrapperClass: "py-4",
		},
		{
			label: t("TRANSACTION.EXPORT.FORM.CRYPTO_AMOUNT"),
			value: (
				<Toggle
					ref={form.register()}
					name="includeCryptoAmount"
					defaultChecked={!!form.getValues("includeCryptoAmount")}
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
					ref={form.register()}
					name="includeFiatAmount"
					defaultChecked={!!form.getValues("includeFiatAmount")}
					data-testid="TransactionExportForm__toggle-include-fiat-amount"
					value={form.getValues("includeFiatAmount")}
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
