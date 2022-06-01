import { Contracts, DTO } from "@payvo/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const MultiSignatureStatus = ({
	wallet,
	transaction,
}: {
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}) => {
	const { t } = useTranslation();

	const isMultiSignatureReady = useMemo(() => {
		try {
			return wallet.coin().multiSignature().isMultiSignatureReady(transaction.data());
		} catch {
			return false;
		}
	}, [wallet, transaction]);

	if (wallet.transaction().isAwaitingOurSignature(transaction.id())) {
		return <>{t("TRANSACTION.MULTISIGNATURE.AWAITING_OUR_SIGNATURE")}</>;
	}

	if (wallet.transaction().isAwaitingOtherSignatures(transaction.id())) {
		return (
			<>
				{t("TRANSACTION.MULTISIGNATURE.AWAITING_OTHER_SIGNATURE_COUNT", {
					count: wallet.coin().multiSignature().remainingSignatureCount(transaction.data()),
				})}
			</>
		);
	}

	if (wallet.transaction().isAwaitingConfirmation(transaction.id())) {
		return <>{t("TRANSACTION.MULTISIGNATURE.AWAITING_CONFIRMATIONS")}</>;
	}

	if (isMultiSignatureReady) {
		return <>{t("TRANSACTION.MULTISIGNATURE.READY")}</>;
	}

	return <>{t("TRANSACTION.MULTISIGNATURE.AWAITING_FINAL_SIGNATURE")}</>;
};
