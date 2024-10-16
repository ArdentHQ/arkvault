import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { Header } from "@/app/components/Header";
import { TransactionDetailContent } from "@/domains/transaction/components/TransactionDetailModal";
import { useTranslation } from "react-i18next";

export const SummaryStep = ({
	wallet,
	transaction,
}: {
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}) => {
	const { t } = useTranslation();

	return (
		<section>
			<Header title={t("TRANSACTION.TRANSACTION_DETAILS")} />
			<TransactionDetailContent
				profile={wallet.profile()}
				transactionItem={transaction}
				containerClassname="-mx-3 sm:mx-0"
			/>
		</section>
	);
};
