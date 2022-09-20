import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BasicSettings, CSVSettings, ColumnSettings } from ".";
import { TransactionExportFormProperties } from "@/domains/transaction/components/TransactionExportModal";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";

export const TransactionExportForm = ({ showFiatColumn, onCancel }: TransactionExportFormProperties) => {
	const { t } = useTranslation();

	const form = useFormContext();
	const { isDirty, isSubmitting, isValid } = form.formState;

	return (
		<div data-testid="TransactionExportForm">
			<BasicSettings />

			<CSVSettings />

			<ColumnSettings showFiatColumn={showFiatColumn} />

			<FormButtons>
				<Button
					variant="secondary"
					onClick={() => onCancel()}
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
		</div>
	);
};
