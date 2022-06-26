import { useForm } from "react-hook-form";
import { useEffect } from "react";

import {
	TransactionType,
	ExportSettings,
	CSVDelimiter,
	DateRange,
} from "@/domains/transaction/components/TransactionExportModal";

export const useTransactionExportForm = () => {
	const form = useForm<ExportSettings>({
		defaultValues: {
			transactionType: TransactionType.All,
			includeHeaderRow: true,
			includeTransactionId: true,
			includeDate: true,
			includeSenderRecipient: true,
			includeCryptoAmount: true,
			includeFiatAmount: true,
			delimiter: CSVDelimiter.Comma,
			dateRange: DateRange.CurrentMonth,
		},
		mode: "onChange",
	});

	useEffect(() => {
		form.register("transactionType");
		form.register("delimiter");
		form.register("dateRange");
	}, []);

	return form;
};
