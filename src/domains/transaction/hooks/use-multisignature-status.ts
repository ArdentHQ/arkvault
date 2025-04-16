import { Contracts, DTO } from "@ardenthq/sdk-profiles";

interface Properties {
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}

export interface MultiSignatureStatus {
	value:
		| "isAwaitingOurSignature"
		| "isAwaitingOtherSignatures"
		| "isAwaitingConfirmation"
		| "isMultiSignatureReady"
		| "isAwaitingFinalSignature"
		| "isAwaitingOurFinalSignature"
		| "isBroadcasted";
	label: string;
	icon: string;
	className: string;
}

const transactionExists = (wallet: Contracts.IReadWriteWallet, transaction: DTO.ExtendedSignedTransactionData) => {
	try {
		return !!wallet.transaction().transaction(transaction.id());
	} catch {
		return false;
	}
};

export const isAwaitingMusigSignatures = (
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData,
) => {
	console.log(transaction);
	return false;
};

export const useMultiSignatureStatus = ({ wallet, transaction }: Properties) => {
	console.log(wallet, transaction);
	return {
		canBeBroadcasted: false,
		canBeSigned: false,
		isAwaitingFinalSignature: false,
		isAwaitingOurFinalSignature: false,
		status: "isAwaitingOurSignature",
	};
};
