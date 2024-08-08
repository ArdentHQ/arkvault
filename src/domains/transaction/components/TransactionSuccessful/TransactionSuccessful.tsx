import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";
import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import { TransactionAddresses, TransactionFee, TransactionType } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Spinner } from "@/app/components/Spinner";
import { Icon } from "@/app/components/Icon";
import { useFormContext } from "react-hook-form";
import { DetailWrapper, DetailLabel } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";
import { TransactionId } from "../TransactionDetail/TransactionId";

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

	const isTransactionConfirmed = false;
	const { getValues } = useFormContext()
	const { recipients } = getValues()
	console.log({ recipients })
	console.log({ isTransactionConfirmed })

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
			<StepHeader title={titleText}
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name="PendingTransaction"
						data-testid="icon-PendingTransaction"
						className="text-theme-primary-600"
					/>
				}
			/>

			<TransactionId transaction={transaction} />

			<TransactionAddresses senderWallet={senderWallet} recipients={recipients} profile={senderWallet.profile()} />

			<TransactionType type={transaction.type()} />

			{children}

			{!isTransactionConfirmed && (
				<div>
					<DetailLabel>{t("TRANSACTION.CONFIRMATIONS")}</DetailLabel>
					<div
						data-testid="PendingConfirmationAlert"
						className="flex items-center space-x-3 rounded-xl border border-theme-warning-200 bg-theme-warning-50 px-6 py-5 dark:border-theme-warning-600 dark:bg-transparent"
					>
						<Spinner color="warning-alt" size="sm" width={3} />
						<Divider type="vertical" className="text-theme-warning-200 dark:text-theme-secondary-800" />
						<p className="font-semibold text-theme-secondary-700 dark:text-theme-warning-600">
							{t("TRANSACTION.PENDING.STATUS_TEXT")}
						</p>
					</div>
				</div>
			)}
		</section>
	);
};
