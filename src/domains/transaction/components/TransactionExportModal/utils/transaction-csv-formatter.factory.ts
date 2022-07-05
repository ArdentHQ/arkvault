import { BigNumber } from "@ardenthq/sdk-helpers";
import { DTO, Helpers } from "@ardenthq/sdk-profiles";
import { buildTranslations } from "@/app/i18n/helpers";

const recipient = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	const { COMMON } = buildTranslations();

	if (transaction.isMultiPayment()) {
		return COMMON.MULTIPLE;
	}

	if (transaction.isTransfer()) {
		return transaction.recipient();
	}

	//TODO: Handle more transaction types.
	return COMMON.OTHER;
};

const multiPaymentAmount = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	if (transaction.sender() !== transaction.wallet().address()) {
		let totalReceived = BigNumber.make(transaction.amount());

		for (const recipient of transaction.recipients()) {
			if (recipient.address !== transaction.wallet().address()) {
				totalReceived = totalReceived.minus(recipient.amount);
			}
		}

		return totalReceived.toNumber();
	}

	return transaction.amount();
};

const transactionAmount = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	const amount = transaction.isMultiPayment() ? multiPaymentAmount(transaction) : transaction.amount();

	if (transaction.isSent()) {
		return BigNumber.make(amount).times(-1).toNumber();
	}

	return amount;
};

const transactionFee = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	if (transaction.isSent()) {
		return BigNumber.make(transaction.fee()).times(-1).toNumber();
	}

	return 0;
};

const transactionTotal = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	if (transaction.isSent()) {
		return BigNumber.make(transaction.total()).times(-1).toNumber();
	}

	return transactionAmount(transaction);
};

const converted = (value: number, rate: BigNumber) => rate.times(value).toNumber();

export const CsvFormatter = (transaction: DTO.ExtendedConfirmedTransactionData, rate: BigNumber) => {
	const { COMMON } = buildTranslations();

	const amount = transactionAmount(transaction);
	const fee = transactionFee(transaction);
	const total = transactionTotal(transaction);

	return {
		amount: () => amount,
		convertedAmount: () => (rate ? converted(amount, rate) : COMMON.NOT_AVAILABLE),
		convertedFee: () => (rate ? converted(fee, rate) : COMMON.NOT_AVAILABLE),
		convertedTotal: () => (rate ? converted(total, rate) : COMMON.NOT_AVAILABLE),
		datetime: () => transaction.timestamp()?.format("DD.MM.YYYY h:mm A"),
		fee: () => fee,
		rate: () => rate.toNumber(),
		recipient: () => recipient(transaction),
		sender: () => transaction.sender(),
		timestamp: () => transaction.timestamp()?.toUNIX(),
		total: () => total,
	};
};
