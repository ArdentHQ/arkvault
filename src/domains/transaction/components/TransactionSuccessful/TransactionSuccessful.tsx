import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";
import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
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
import { Spinner } from "@/app/components/Spinner";

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

	const isTransactionConfirmed = useConfirmedTransaction({ transactionId: transaction.id(), wallet: senderWallet });

	if (transaction.isMultiSignatureRegistration() || transaction.usesMultiSignature()) {
		return (
			<MultiSignatureSuccessful transaction={transaction} senderWallet={senderWallet}>
				<TransactionFee currency={senderWallet.currency()} value={transaction.fee()} paddingPosition="top" />
			</MultiSignatureSuccessful>
		);
	}

	const descriptionText =
		description ??
		(isTransactionConfirmed ? t("TRANSACTION.SUCCESS.DESCRIPTION") : t("TRANSACTION.PENDING.DESCRIPTION"));

	const titleText =
		title ?? (isTransactionConfirmed ? t("TRANSACTION.SUCCESS.TITLE") : t("TRANSACTION.PENDING.TITLE"));

	return (
		<section
			data-testid={isTransactionConfirmed ? "TransactionSuccessful" : "TransactionPending"}
			className="space-y-8"
		>
			<StepHeader title={titleText} />

			{isTransactionConfirmed ? (
				<Image name="TransactionSuccessBanner" domain="transaction" className="hidden w-full md:block" />
			) : (
				<Image
					name="TransactionPendingBanner"
					domain="transaction"
					className="hidden w-full md:block"
					useAccentColor={false}
				/>
			)}

			<p className="hidden text-theme-secondary-text md:block">{descriptionText}</p>

			<Alert variant="success" className="md:hidden">
				{descriptionText}
			</Alert>

			<div>
				{isTransactionConfirmed && (
					<TransactionExplorerLink
						transaction={transaction}
						border={false}
						paddingPosition="bottom"
						borderPosition="bottom"
					/>
				)}

				<TransactionType type={transaction.type()} />

				<TransactionNetwork network={senderWallet.network()} />

				<TransactionSender address={senderWallet.address()} network={senderWallet.network()} />

				{children}

				{!isTransactionConfirmed && (
					<div className="mt-8 flex space-x-2 rounded border border-transparent bg-theme-warning-50 px-3 py-2 text-theme-warning-900 dark:border-theme-warning-600 dark:bg-transparent dark:text-theme-warning-600">
						<Spinner size="sm" width={3} color="warning-alt" />

						<span className="font-semibold">{t("TRANSACTION.PENDING.STATUS_TEXT")}</span>
					</div>
				)}
			</div>
		</section>
	);
};
