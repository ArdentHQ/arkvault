import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";
import { Image } from "@/app/components/Image";
import {
	TransactionExplorerLink,
	TransactionNetwork,
	TransactionSender,
	TransactionType,
	TransactionFee,
} from "@/domains/transaction/components/TransactionDetail";
import { Alert } from "@/app/components/Alert";
import { StepHeader } from "@/app/components/StepHeader";

interface TransactionSuccessfulProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	title?: string;
	description?: string;
	children?: React.ReactNode;
}

export const TransactionSuccessful = ({
	transaction,
	senderWallet,
	title,
	description,
	children,
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	if (transaction.isMultiSignatureRegistration() || transaction.usesMultiSignature()) {
		return (
			<MultiSignatureSuccessful transaction={transaction} senderWallet={senderWallet}>
				<TransactionFee currency={senderWallet.currency()} value={transaction.fee()} paddingPosition="top" />
			</MultiSignatureSuccessful>
		);
	}

	return (
		<section data-testid="TransactionSuccessful" className="space-y-8">
			<StepHeader title={title ?? t("TRANSACTION.SUCCESS.TITLE")} />

			<Image name="TransactionSuccessBanner" domain="transaction" className="hidden w-full md:block" />

			<p className="hidden text-theme-secondary-text md:block">
				{description ?? t("TRANSACTION.SUCCESS.DESCRIPTION")}
			</p>

			<Alert variant="success" className="md:hidden">
				{description ?? t("TRANSACTION.SUCCESS.DESCRIPTION")}
			</Alert>

			<div>
				<TransactionExplorerLink
					transaction={transaction}
					border={false}
					paddingPosition="bottom"
					borderPosition="bottom"
				/>

				<TransactionType type={transaction.type()} />

				<TransactionNetwork network={senderWallet.network()} />

				<TransactionSender address={senderWallet.address()} network={senderWallet.network()} />

				{children}
			</div>
		</section>
	);
};
