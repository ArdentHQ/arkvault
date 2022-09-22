import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BasicSettings, CSVSettings, ColumnSettings } from ".";
import { TransactionExportFormProperties } from "@/domains/transaction/components/TransactionExportModal";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";

export const TransactionExportForm = ({ wallet, onCancel }: TransactionExportFormProperties) => {
	const { t } = useTranslation();

	const form = useFormContext();
	const { isDirty, isSubmitting, isValid } = form.formState;

	const [minStartDate, setMinStartDate] = useState<Date | undefined>();

	useEffect(() => {
		const fetchFirstTransaction = async () => {
			let date: Date | undefined = new Date(
				wallet.manifest().get<object>("networks")[wallet.networkId()].constants.epoch,
			);

			try {
				const transactions = await wallet.transactionIndex().all({ orderBy: "timestamp:asc" });
				date = transactions.first().timestamp()?.toDate();
			} catch {
				//
			}

			setMinStartDate(date);
		};

		fetchFirstTransaction();
	}, [wallet]);

	const showFiatColumn = wallet.network().isLive();

	return (
		<div data-testid="TransactionExportForm">
			<BasicSettings minStartDate={minStartDate} />

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
