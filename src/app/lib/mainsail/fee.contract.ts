import { BigNumber } from "@/app/lib/helpers";

import { SignedTransactionData } from "./dto";
import { EncodeFunctionDataReturnType } from "viem";

export interface TransactionFee {
	max: BigNumber;
	min: BigNumber;
	avg: BigNumber;
}

export interface EstimateGasPayload {
	from: string;
	to: string;
	data?: EncodeFunctionDataReturnType;
	value?: string;
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
	evmCall: TransactionFee;
}

export interface FeeService {
	all(): Promise<TransactionFees>;

	calculate(transaction: SignedTransactionData, options?: TransactionFeeOptions): Promise<BigNumber>;
}

export interface TransactionFeeOptions {
	priority?: "slow" | "average" | "fast";
}
