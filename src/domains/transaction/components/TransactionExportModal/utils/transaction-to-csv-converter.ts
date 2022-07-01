import { DTO } from "@ardenthq/sdk-profiles";
import { CsvFormatter } from "./transaction-csv-formatter.factory";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { buildTranslations } from "@/app/i18n/helpers";

const headers = (settings: CsvSettings) => {
	const { COMMON } = buildTranslations();

	return [
		...(settings.includeTransactionId ? [COMMON.ID] : []),
		...(settings.includeDate ? [] : [`${COMMON.DATE} - ${COMMON.TIMESTAMP}`]),
		...(settings.includeSenderRecipient ? [COMMON.SENDER, COMMON.RECIPIENT] : []),
		...(settings.includeCryptoAmount ? [COMMON.AMOUNT, COMMON.FEE, COMMON.TOTAL] : []),
	].join(settings.delimiter);
};

const transactionToCsv = (transaction: DTO.ExtendedConfirmedTransactionData, settings: CsvSettings) => {
	const fields = CsvFormatter(transaction);

	const columns = [
		...(settings.includeTransactionId ? [transaction.id()] : []),
		...(settings.includeDate ? [`${fields.datetime()} - ${fields.timestamp()}`] : []),
		...(settings.includeSenderRecipient ? [fields.sender(), fields.recipient()] : []),
		...(settings.includeCryptoAmount ? [fields.amount(), fields.fee(), fields.total()] : []),
	];

	return columns.join(settings.delimiter);
};

export const convertToCsv = (transactions: DTO.ExtendedConfirmedTransactionData[], settings: CsvSettings) => {
	const rows = transactions.map((transaction) => transactionToCsv(transaction, settings));

	if (!settings.includeHeaderRow) {
		return rows.join("\n");
	}

	return [headers(settings), ...rows].join("\n");
};
