import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Signatures } from "./Signatures";
import { Header } from "@/app/components/Header";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { transactionPublicKeys } from "./MultiSignatureDetail.helpers";
import { DetailLabel } from "@/app/components/DetailWrapper";

export const SentStep = ({
	transaction,
	wallet,
	isBroadcast,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	wallet: Contracts.IReadWriteWallet;
	isBroadcast: boolean;
}) => {
	const { t } = useTranslation();

	const title = isBroadcast ? t("TRANSACTION.SUCCESS.TITLE") : t("TRANSACTION.TRANSACTION_SIGNED");

	if (wallet.transaction().isAwaitingConfirmation(transaction.id())) {
		return <TransactionSuccessful transaction={transaction} senderWallet={wallet} />;
	}

	return (
		<section>
			<Header title={title} />
			<p className="text-theme-secondary-700">
				{t("TRANSACTION.MODAL_MULTISIGNATURE_DETAIL.STEP_3.DESCRIPTION")}
			</p>

			<div className="mt-4">
				<DetailLabel>{t("TRANSACTION.PARTICIPANTS")}</DetailLabel>
				<div className="mt-2">
					<Signatures transaction={transaction} profile={wallet.profile()} publicKeys={transactionPublicKeys(transaction).publicKeys} />
				</div>
			</div>
		</section>
	);
};
