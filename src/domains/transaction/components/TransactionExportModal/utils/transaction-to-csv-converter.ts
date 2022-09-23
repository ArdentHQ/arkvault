import { DTO } from "@ardenthq/sdk-profiles";
import { CsvFormatter } from "./transaction-csv-formatter.factory";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { buildTranslations } from "@/app/i18n/helpers";

const getHeaders = (settings: CsvSettings, exchangeCurrency: string) => {
	const { COMMON } = buildTranslations();

	const buildFiatHeaders = (exchangeCurrency: string) =>
		[COMMON.FIAT_AMOUNT, COMMON.FIAT_FEE, COMMON.FIAT_TOTAL].map(
			(header: string) => `${header} [${exchangeCurrency}]`,
		);

	const headers: string[] = [];

	if (settings.includeTransactionId) {
		headers.push(COMMON.ID);
	}

	if (settings.includeDate) {
		headers.push(`${COMMON.DATE} & ${COMMON.TIME}`);
	}

	if (settings.includeSenderRecipient) {
		headers.push(COMMON.SENDER, COMMON.RECIPIENT);
	}

	if (settings.includeCryptoAmount) {
		headers.push(COMMON.AMOUNT, COMMON.FEE, COMMON.TOTAL);
	}

	if (settings.includeFiatAmount) {
		headers.push(...buildFiatHeaders(exchangeCurrency), COMMON.RATE);
	}

	return headers.join(settings.delimiter);
};

const transactionToCsv = (
	transaction: DTO.ExtendedConfirmedTransactionData,
	settings: CsvSettings,
	timeFormat: string,
) => {
	const fields = CsvFormatter(transaction, timeFormat);

	const row: any[] = [];

	if (settings.includeTransactionId) {
		row.push(transaction.id());
	}

	if (settings.includeDate) {
		row.push(fields.datetime());
	}

	if (settings.includeSenderRecipient) {
		row.push(fields.sender(), fields.recipient());
	}

	if (settings.includeCryptoAmount) {
		row.push(fields.amount(), fields.fee(), fields.total());
	}

	if (settings.includeFiatAmount) {
		row.push(fields.convertedAmount(), fields.convertedFee(), fields.convertedTotal(), fields.rate());
	}

	return row.join(settings.delimiter);
};

export const convertToCsv = (
	transactions: DTO.ExtendedConfirmedTransactionData[],
	settings: CsvSettings,
	exchangeCurrency: string,
	timeFormat: string,
) => {
	const rows = transactions.map((transaction) => transactionToCsv(transaction, settings, timeFormat));

	if (settings.includeHeaderRow) {
		rows.unshift(getHeaders(settings, exchangeCurrency));
	}

	return rows.join("\n");
};
