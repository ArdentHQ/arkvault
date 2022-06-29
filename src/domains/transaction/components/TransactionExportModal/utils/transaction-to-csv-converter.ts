import { DTO } from "@ardenthq/sdk-profiles";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { buildTranslations } from "@/app/i18n/helpers";
import { AmountFormatter } from "./transaction-amount-formatter.factory";

const headers = (settings: CsvSettings) => {
	const { COMMON } = buildTranslations();

	return [
		...(settings.includeTransactionId ? [COMMON.ID] : []),
		...(settings.includeDate ? [COMMON.TIMESTAMP, COMMON.DATE] : []),
		...(settings.includeSenderRecipient ? [COMMON.SENDER, COMMON.RECIPIENT] : []),
		...(settings.includeCryptoAmount ? [COMMON.AMOUNT, COMMON.FEE, COMMON.TOTAL] : []),
	].join(settings.delimiter);
};

const transactionToCsv = (transaction: DTO.ExtendedConfirmedTransactionData, settings: CsvSettings) => {
	const dateTimeFormat = "DD.MM.YYYY h:mm A";
	const timestamp = transaction.timestamp()?.toUNIX();
	const datetime = transaction.timestamp()?.format(dateTimeFormat);
	const sender = transaction.sender();
	const recipient = transaction.recipient();
	const amounts = AmountFormatter(transaction);

	const columns = [
		...(settings.includeTransactionId ? [transaction.id()] : []),
		...(settings.includeDate ? [timestamp, datetime] : []),
		...(settings.includeSenderRecipient ? [sender, recipient] : []),
		...(settings.includeCryptoAmount ? [amounts.amount(), amounts.fee(), amounts.total()] : []),
	];

	return columns.join(settings.delimiter);
};

export const convertToCsv = (transactions: DTO.ExtendedConfirmedTransactionData[], settings: CsvSettings) => {
	const rows = transactions.map((transaction) => transactionToCsv(transaction, settings));

	if (!settings.includeHeaderRow) {
		return rows.join("\n");
	}

	return [...[headers(settings)], ...rows].join("\n");
};
