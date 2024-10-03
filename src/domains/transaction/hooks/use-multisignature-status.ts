import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
	try {
		if ([transaction.isConfirmed(), transaction.confirmations().isGreaterThan(0)].some(Boolean)) {
			return false;
		}

		return !transaction.wallet().transaction().hasBeenBroadcasted(transaction.id());
	} catch {
		// Transaction isBroadcasted and it doesn't exist in the wallet's local repository.
		return false;
	}
};

export const useMultiSignatureStatus = ({ wallet, transaction }: Properties) => {
	const { t } = useTranslation();

	const canBeSigned = useMemo(() => {
		try {
			return wallet.transaction().canBeSigned(transaction.id());
		} catch {
			return false;
		}
	}, [wallet, transaction]);

	const status: MultiSignatureStatus = useMemo(() => {
		if (
			[
				!isAwaitingMusigSignatures(transaction),
				!transactionExists(wallet, transaction),
				!wallet.isMultiSignature() && !transaction.isMultiSignatureRegistration(),
			].some(Boolean)
		) {
			return {
				className: "",
				icon: "",
				label: "",
				value: "isBroadcasted",
			};
		}

		if (wallet.transaction().isAwaitingConfirmation(transaction.id())) {
			return {
				className: "text-theme-warning-300",
				icon: "Clock",
				label: t("TRANSACTION.MULTISIGNATURE.AWAITING_CONFIRMATIONS"),
				value: "isAwaitingConfirmation",
			};
		}

		if (
			wallet.transaction().isAwaitingOurSignature(transaction.id()) &&
			wallet.transaction().isAwaitingOtherSignatures(transaction.id())
		) {
			return {
				className: "text-theme-secondary-700",
				icon: "Pencil",
				label: t("TRANSACTION.MULTISIGNATURE.AWAITING_OUR_SIGNATURE"),
				value: "isAwaitingOurSignature",
			};
		}

		if (
			wallet.transaction().isAwaitingOurSignature(transaction.id()) &&
			!wallet.coin().multiSignature().remainingSignatureCount(transaction.data())
		) {
			return {
				className: "text-theme-secondary-700",
				icon: "Pencil",
				label: t("TRANSACTION.MULTISIGNATURE.AWAITING_OUR_BROADCAST"),
				value: "isAwaitingOurFinalSignature",
			};
		}

		if (transaction.sender() === wallet.address() && wallet.transaction().canBeBroadcasted(transaction.id())) {
			return {
				className: "text-theme-secondary-700",
				icon: "Pencil",
				label: t("TRANSACTION.MULTISIGNATURE.AWAITING_OUR_BROADCAST"),
				value: "isAwaitingOurFinalSignature",
			};
		}

		if (wallet.transaction().isAwaitingOurSignature(transaction.id())) {
			return {
				className: "text-theme-secondary-700",
				icon: "Pencil",
				label: t("TRANSACTION.MULTISIGNATURE.AWAITING_OUR_SIGNATURE"),
				value: "isAwaitingOurSignature",
			};
		}

		if (wallet.transaction().isAwaitingOtherSignatures(transaction.id())) {
			return {
				className: "text-theme-warning-300",
				icon: "ClockPencil",
				label: t("TRANSACTION.MULTISIGNATURE.AWAITING_OTHER_SIGNATURE_COUNT", {
					count: wallet.coin().multiSignature().remainingSignatureCount(transaction.data()),
				}),
				value: "isAwaitingOtherSignatures",
			};
		}

		if (wallet.transaction().canBeBroadcasted(transaction.id())) {
			return {
				className: "text-theme-success-500",
				icon: "DoubleArrowRight",
				label: t("TRANSACTION.MULTISIGNATURE.AWAITING_FINAL_SIGNATURE_AND_BROADCAST"),
				value: "isMultiSignatureReady",
			};
		}

		return {
			className: "text-theme-success-500",
			icon: "CircleCheckMarkPencil",
			label: t("TRANSACTION.MULTISIGNATURE.AWAITING_FINAL_SIGNATURE_AND_BROADCAST"),
			value: "isAwaitingFinalSignature",
		};
	}, [wallet, transaction, t]);

	return {
		canBeBroadcasted: canBeBroadcasted(wallet, transaction),
		canBeSigned,
		isAwaitingFinalSignature: status.value === "isAwaitingFinalSignature",
		isAwaitingOurFinalSignature: status.value === "isAwaitingOurFinalSignature",
		status,
	};
};
