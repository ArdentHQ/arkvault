import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Toggle } from "@/app/components/Toggle";
import { ListDivided } from "@/app/components/ListDivided";

export const ColumnSettings = () => {
	const { t } = useTranslation();
	const form = useFormContext();

	return (
		<ListDivided
			items={[
				{
					wrapperClass: "py-4",
					label: t("TRANSACTION.EXPORT.FORM.TRANSACTION_ID"),
					value: (
						<Toggle
							ref={form.register()}
							name="includeTransactionId"
							defaultChecked={!!form.getValues("includeTransactionId")}
							data-testid="TransactionExportForm__toggle-include-tx-id"
						/>
					),
				},
				{
					wrapperClass: "py-4",
					label: t("TRANSACTION.EXPORT.FORM.TRANSACTION_DATE"),
					value: (
						<Toggle
							ref={form.register()}
							name="includeDate"
							defaultChecked={!!form.getValues("includeDate")}
							data-testid="TransactionExportForm__toggle-include-date"
						/>
					),
				},
				{
					wrapperClass: "py-4",
					label: t("TRANSACTION.EXPORT.FORM.SENDER_RECIPIENT"),
					value: (
						<Toggle
							ref={form.register()}
							name="includeSenderRecipient"
							defaultChecked={!!form.getValues("includeSenderRecipient")}
							data-testid="TransactionExportForm__toggle-include-crypto-amount"
						/>
					),
				},
				{
					wrapperClass: "py-4",
					label: t("TRANSACTION.EXPORT.FORM.CRYPTO_AMOUNT"),
					value: (
						<Toggle
							ref={form.register()}
							name="includeCryptoAmount"
							defaultChecked={!!form.getValues("includeCryptoAmount")}
							data-testid="TransactionExportForm__toggle-include-crypto-amount"
						/>
					),
				},
				{
					wrapperClass: "py-4",
					label: t("TRANSACTION.EXPORT.FORM.FIAT_AMOUNT"),
					value: (
						<Toggle
							ref={form.register()}
							name="includeFiatAmount"
							defaultChecked={!!form.getValues("includeFiatAmount")}
							data-testid="TransactionExportForm__toggle-include-tx-id"
						/>
					),
				},
			]}
		/>
	);
};
