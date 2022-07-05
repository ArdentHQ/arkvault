import { useForm } from "react-hook-form";
import { useEffect } from "react";

import {
	TransactionType,
	ExportSettings,
	CsvDelimiter,
	DateRange,
} from "@/domains/transaction/components/TransactionExportModal";

export const useTransactionExportForm = () => {
	const form = useForm<ExportSettings>({
		defaultValues: {
			dateRange: DateRange.CurrentMonth,
			delimiter: CsvDelimiter.Comma,
			includeCryptoAmount: true,
			includeDate: true,
			includeFiatAmount: true,
			includeHeaderRow: true,
			includeSenderRecipient: true,
			includeTransactionId: false,
			transactionType: TransactionType.All,
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
