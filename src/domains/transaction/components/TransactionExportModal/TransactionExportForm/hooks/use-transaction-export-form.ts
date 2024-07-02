import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
	CsvDelimiter,
	DateRange,
	ExportSettings,
	TransactionType,
} from "@/domains/transaction/components/TransactionExportModal";

interface ExportFormErrors {
	noColumns?: never;
}

export const useTransactionExportForm = () => {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 7);

	const form = useForm<ExportSettings & ExportFormErrors>({
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
			setError("noColumns", { type: "manual" });
			return;
		}

		clearErrors("noColumns");
	}, [includeCryptoAmount, includeDate, includeFiatAmount, includeSenderRecipient, includeTransactionId]);

	return form;
};
