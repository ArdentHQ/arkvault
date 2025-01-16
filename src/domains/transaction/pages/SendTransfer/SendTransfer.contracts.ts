import { Coins, Networks } from "@ardenthq/sdk";
import { TransactionFees } from "types";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

export enum SendTransferStep {
	NetworkStep,
	FormStep,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export interface SendTransferForm {
	senderAddress: string;
	fees: TransactionFees;
	gasPrice: number;
	gasLimit: number;
	remainingBalance: number;
	amount: string;
	isSendAllSelected: string;
	network?: Networks.Network;
	recipients: RecipientItem[];
	mnemonic: string;
	secondMnemonic: string;
	memo: string;
	encryptionPassword: string;
	wif: string;
	privateKey: string;
	secret: string;
	secondSecret: string;
}

export interface BuildTransferDataProperties {
	isMultiSignature?: boolean;
	coin: Coins.Coin;
	recipients?: RecipientItem[];
	memo?: string;
}
