import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactionExportForm } from "./hooks";
import { BasicSettings, CSVSettings, ColumnSettings } from ".";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { TransactionExportFormProperties } from "@/domains/transaction/components/TransactionExportModal";

export const TransactionExportForm = ({ wallet, onCancel, onExport }: TransactionExportFormProperties) => {
	const { t } = useTranslation();

	const form = useTransactionExportForm();
	const { isDirty, isSubmitting, isValid } = form.formState;

	return (
		<Form
			data-testid="TransactionExportForm"
			context={form}
			onSubmit={() => {
				onExport?.(form.getValues());
			}}
			className="mt-8"
		>
			<BasicSettings />

			<CSVSettings />

			<ColumnSettings showFiatColumn={wallet.network().isLive()} />

			<FormButtons>
				<Button
					variant="secondary"
					onClick={() => onCancel?.()}
					data-testid="TransactionExportForm__cancel-button"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Button
					type="submit"
					disabled={isSubmitting || (isDirty ? !isValid : false)}
					variant="primary"
					data-testid="TransactionExport__submit-button"
				>
					{t("COMMON.EXPORT")}
				</Button>
			</FormButtons>
		</Form>
	);
};
