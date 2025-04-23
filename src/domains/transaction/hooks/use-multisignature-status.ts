import { Contracts, DTO } from "@/app/lib/profiles";
import { useMemo } from "react";

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

const canBeBroadcasted = (wallet: Contracts.IReadWriteWallet, transaction: DTO.ExtendedSignedTransactionData) => {
	try {
		return (
			wallet.transaction().canBeBroadcasted(transaction.id()) &&
			!wallet.transaction().isAwaitingConfirmation(transaction.id())
		);
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
	const canBeSigned = useMemo(() => {
		try {
			return wallet.transaction().canBeSigned(transaction.id());
		} catch {
			return false;
		}
	}, [wallet, transaction]);

	const status = {
		className: "",
		icon: "",
		label: "",
		value: "isBroadcasted",
	};

	return {
		canBeBroadcasted: canBeBroadcasted(wallet, transaction),
		canBeSigned,
		isAwaitingFinalSignature: status.value === "isAwaitingFinalSignature",
		isAwaitingOurFinalSignature: status.value === "isAwaitingOurFinalSignature",
		status,
	};
};
