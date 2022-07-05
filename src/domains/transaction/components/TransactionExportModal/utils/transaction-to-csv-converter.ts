import { DTO } from "@ardenthq/sdk-profiles";
import { BigNumber, last } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { CsvFormatter } from "./transaction-csv-formatter.factory";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { buildTranslations } from "@/app/i18n/helpers";
import { TransactionRates } from "@/domains/transaction/components/TransactionExportModal/utils/transaction-rates.service";

const getHeaders = (settings: CsvSettings, exchangeCurrency: string) => {
	const { COMMON } = buildTranslations();

	const buildFiatHeaders = (exchangeCurrency: string) =>
		[COMMON.FIAT_AMOUNT, COMMON.FIAT_FEE, COMMON.FIAT_TOTAL].map(
			(header: string) => `${header} [${exchangeCurrency}]`,
		);

	return [
		...(settings.includeTransactionId ? [COMMON.ID] : []),
		...(settings.includeDate ? [`${COMMON.DATE} & ${COMMON.TIME}`] : []),
		...(settings.includeSenderRecipient ? [COMMON.SENDER, COMMON.RECIPIENT] : []),
		...(settings.includeCryptoAmount ? [COMMON.AMOUNT, COMMON.FEE, COMMON.TOTAL] : []),
		...(settings.includeFiatAmount ? [...buildFiatHeaders(exchangeCurrency), COMMON.RATE] : []),
	].join(settings.delimiter);
};

const transactionToCsv = (
	transaction: DTO.ExtendedConfirmedTransactionData,
	settings: CsvSettings,
	rate: BigNumber,
) => {
	const fields = CsvFormatter(transaction, rate);

	return [
		...(settings.includeTransactionId ? [transaction.id()] : []),
		...(settings.includeDate ? [fields.datetime()] : []),
		...(settings.includeSenderRecipient ? [fields.sender(), fields.recipient()] : []),
		...(settings.includeCryptoAmount ? [fields.amount(), fields.fee(), fields.total()] : []),
		...(settings.includeFiatAmount
			? [fields.convertedAmount(), fields.convertedFee(), fields.convertedTotal(), fields.rate()]
			: []),
	].join(settings.delimiter);
};

export const convertToCsv = async (
	transactions: DTO.ExtendedConfirmedTransactionData[],
	settings: CsvSettings,
	exchangeCurrency: string,
) => {
	const rates = TransactionRates({ wallet: transactions[0].wallet() });

	if (settings.includeFiatAmount) {
		await rates.sync({ to: last(transactions).timestamp() as DateTime });
	}

	const rows = transactions.map((transaction) =>
		transactionToCsv(transaction, settings, rates.byDay(transaction.timestamp())),
	);

	if (settings.includeHeaderRow) {
		rows.unshift(getHeaders(settings, exchangeCurrency));
	}

	return rows.join("\n");
};
