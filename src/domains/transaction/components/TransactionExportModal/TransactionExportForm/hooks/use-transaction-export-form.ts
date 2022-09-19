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
			transactionType: TransactionType.Incoming,
		},
		mode: "onChange",
	});

	const { clearErrors, register, setError, watch } = form;

	useEffect(() => {
		register("transactionType");
		register("delimiter");
		register("dateRange");
		register("includeHeaderRow");
		register("includeTransactionId");
		register("includeDate");
		register("includeSenderRecipient");
		register("includeCryptoAmount");
		register("includeFiatAmount");
	}, [register]);

	const { includeCryptoAmount, includeDate, includeFiatAmount, includeSenderRecipient, includeTransactionId } =
		watch();

	useEffect(() => {
		// Trigger invalid state.
		if (
			[includeCryptoAmount, includeDate, includeFiatAmount, includeSenderRecipient, includeTransactionId].filter(
				Boolean,
			).length === 0
		) {
			setError("includeCryptoAmount", {});
			return;
		}

		clearErrors("includeCryptoAmount");
	}, [includeCryptoAmount, includeDate, includeFiatAmount, includeSenderRecipient, includeTransactionId]);

	return form;
};
