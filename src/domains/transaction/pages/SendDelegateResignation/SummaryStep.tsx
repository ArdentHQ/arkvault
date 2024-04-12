import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { TransactionDetail, TransactionFee } from "@/domains/transaction/components/TransactionDetail";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";

interface SummaryStepProperties {
	senderWallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}

export const SummaryStep = ({ senderWallet, transaction }: SummaryStepProperties) => {
	const { t } = useTranslation();

	return (
		<TransactionSuccessful transaction={transaction} senderWallet={senderWallet}>
			<TransactionDetail label={selectDelegateValidatorTranslation({
				delegateStr: t("TRANSACTION.DELEGATE_NAME"),
				network: senderWallet.network(),
				validatorStr: t("TRANSACTION.VALIDATOR_NAME"),
			})}>
				{senderWallet.username()}
			</TransactionDetail>

			<TransactionFee currency={senderWallet.currency()} value={transaction.fee()} paddingPosition="top" />
		</TransactionSuccessful>
	);
};
