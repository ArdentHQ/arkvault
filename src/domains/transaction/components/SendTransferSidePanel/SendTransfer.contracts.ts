import { Networks } from "@/app/lib/mainsail";
import { TransactionFees } from "types";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { BigNumber } from "@/app/lib/helpers";
import { WalletToken } from "@/app/lib/profiles/wallet-token";

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
	remainingBalance: BigNumber;
	recipientAddress: string;
	amount: BigNumber;
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
	tokenContractAddress?: string;
	tokens?: WalletToken[];
}

export interface BuildTransferDataProperties {
	isMultiSignature?: boolean;
	recipients?: RecipientItem[];
	memo?: string;
}
