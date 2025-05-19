import { BigNumber } from "@/app/lib/helpers";

import { SignedTransactionData } from "./dto";

export interface TransactionFee {
	max: BigNumber;
	min: BigNumber;
	avg: BigNumber;
}

export interface TransactionFees {
	// Core
	transfer: TransactionFee;
	secondSignature: TransactionFee;
	validatorRegistration: TransactionFee;
	usernameRegistration: TransactionFee;
	usernameResignation: TransactionFee;
	vote: TransactionFee;
	multiPayment: TransactionFee;
	validatorResignation: TransactionFee;
}

export interface FeeService {
	all(): Promise<TransactionFees>;

	calculate(transaction: SignedTransactionData, options?: TransactionFeeOptions): Promise<BigNumber>;
}

export interface TransactionFeeOptions {
	priority?: "slow" | "average" | "fast";
}
