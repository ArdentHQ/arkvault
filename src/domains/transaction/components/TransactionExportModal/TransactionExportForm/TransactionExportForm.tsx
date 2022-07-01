import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactionExportForm } from "./hooks";
import { BasicSettings, CSVSettings, ColumnSettings } from ".";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { TransactionExportFormProperties } from "@/domains/transaction/components/TransactionExportModal";

export const TransactionExportForm = ({ onCancel, onExport }: TransactionExportFormProperties) => {
	const { t } = useTranslation();
	const form = useTransactionExportForm();

	return (
		<Form
			data-testid="TransactionExportForm"
			context={form}
			onSubmit={() => {
				console.log(form.getValues());
				onExport?.(form.getValues());
			}}
			className="mt-8"
		>
			<BasicSettings />

			<CSVSettings />

			<ColumnSettings />

			<FormButtons>
				<Button
					variant="secondary"
					onClick={() => onCancel?.()}
					data-testid="TransactionExportForm__cancel-button"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Button type="submit" variant="primary" data-testid="TransactionExport__submit-button">
					{t("COMMON.EXPORT")}
				</Button>
			</FormButtons>
		</Form>
	);
};
