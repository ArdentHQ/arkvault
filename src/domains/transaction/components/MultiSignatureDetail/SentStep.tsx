import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Signatures } from "./Signatures";
import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";
import { MultiSignatureSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { TransactionFee } from "@/domains/transaction/components/TransactionDetail";

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
	const bannerName = isBroadcast ? "TransactionSuccessBanner" : "TransactionSignedBanner";

	if (wallet.transaction().isAwaitingConfirmation(transaction.id())) {
		return (
			<MultiSignatureSuccessful
				title={t("TRANSACTION.SUCCESS.TITLE")}
				banner={"TransactionSuccessBanner"}
				transaction={transaction}
				senderWallet={wallet}
				description={t("TRANSACTION.SUCCESS.DESCRIPTION")}
			/>
		);
	}

	return (
		<section>
			<Header title={title} />

			<Image name={bannerName} domain="transaction" className="my-4 w-full" />

			<p className="text-theme-secondary-700">
				{t("TRANSACTION.MODAL_MULTISIGNATURE_DETAIL.STEP_3.DESCRIPTION")}
			</p>

			<div className="mt-4">
				<Signatures transaction={transaction} wallet={wallet} />
			</div>
		</section>
	);
};
