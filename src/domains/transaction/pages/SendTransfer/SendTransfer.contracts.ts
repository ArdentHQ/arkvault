import { Networks } from "@/app/lib/mainsail";
import { TransactionFees } from "types";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { BigNumber } from "@/app/lib/helpers";

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
	gasPrice: BigNumber;
	gasLimit: BigNumber;
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
	recipients?: RecipientItem[];
	memo?: string;
}
