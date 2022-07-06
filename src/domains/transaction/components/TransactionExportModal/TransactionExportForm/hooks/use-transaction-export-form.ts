import { useForm } from "react-hook-form";
import { useEffect } from "react";

import {
	TransactionType,
	ExportSettings,
	CsvDelimiter,
	DateRange,
} from "@/domains/transaction/components/TransactionExportModal";

export const useTransactionExportForm = () => {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 7);

	const form = useForm<ExportSettings>({
		defaultValues: {
			dateRange: DateRange.CurrentMonth,
			delimiter: CsvDelimiter.Comma,
			from: startDate,
			includeCryptoAmount: true,
			includeDate: true,
			includeFiatAmount: true,
			includeHeaderRow: true,
			includeSenderRecipient: true,
			includeTransactionId: true,
			to: new Date(),
			transactionType: TransactionType.All,
		},
		mode: "onChange",
	});

	useEffect(() => {
		form.register("transactionType");
		form.register("delimiter");
		form.register("dateRange");
	}, []);

	const { includeCryptoAmount, includeDate, includeFiatAmount, includeSenderRecipient, includeTransactionId } =
		form.watch();

	useEffect(() => {
		// Trigger invalid state.
		if (
			[includeCryptoAmount, includeDate, includeFiatAmount, includeSenderRecipient, includeTransactionId].filter(
				Boolean,
			).length === 0
		) {
			form.setError("includeCryptoAmount", {});
			return;
		}

		form.clearErrors("includeCryptoAmount");
	}, [includeCryptoAmount, includeDate, includeFiatAmount, includeSenderRecipient, includeTransactionId]);

	return form;
};
