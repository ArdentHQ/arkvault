import { Contracts, DTO } from "@/app/lib/profiles";

interface PendingTransaction {
	transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;
	hasBeenSigned: boolean;
	isPendingTransfer: boolean;
	isAwaitingConfirmation: boolean;
	isAwaitingOurSignature: boolean;
	isAwaitingOtherSignatures: boolean;
}

interface Properties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	pendingTransactions: PendingTransaction[];
	onClick?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRemove?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onPendingTransactionClick?: (transaction: DTO.ExtendedConfirmedTransactionData) => void;
}

export type { PendingTransaction, Properties };
