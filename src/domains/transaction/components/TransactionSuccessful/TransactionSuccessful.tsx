import cn from "classnames";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";
import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import {
	TransactionAddresses,
	TransactionConfirmations,
	TransactionFee,
	TransactionType,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { DetailLabel } from "@/app/components/DetailWrapper";
import { TransactionId } from "@/domains/transaction/components/TransactionDetail/TransactionId";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

interface TransactionSuccessfulProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	title?: string;
	description?: string;
	children?: React.ReactNode;
	recipients?: RecipientItem[];
}

export const TransactionDetailPadded = ({ children }: { children: React.ReactNode }) => (
	<div className="group flex">
		<div className="hidden sm:ml-3 sm:flex">
			<div className="min-w-9 flex-row pr-3">
				<div className="-mt-2 h-6 w-full rounded-bl-xl border-b-2 border-l-2 border-theme-secondary-300 dark:border-theme-secondary-800" />
				<div className="h-[110%] w-full border-l-2 border-theme-secondary-300 group-last:hidden dark:border-theme-secondary-800" />
			</div>
		</div>
		<div className="w-full sm:flex-row">{children}</div>
	</div>
);

export const TransactionSuccessful = ({
	transaction,
	senderWallet,
	title,
	children,
	recipients = [],
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	const { isConfirmed, confirmations } = useConfirmedTransaction({
		transactionId: transaction.id(),
		wallet: senderWallet,
	});

	if (transaction.isMultiSignatureRegistration() || transaction.usesMultiSignature()) {
		return (
			<MultiSignatureSuccessful transaction={transaction} senderWallet={senderWallet}>
				<TransactionFee currency={senderWallet.currency()} value={transaction.fee()} paddingPosition="top" />
			</MultiSignatureSuccessful>
		);
	}

	const titleText = title ?? (isConfirmed ? t("TRANSACTION.SUCCESS.CONFIRMED") : t("TRANSACTION.PENDING.TITLE"));

	return (
		<section data-testid={isConfirmed ? "TransactionSuccessful" : "TransactionPending"}>
			<StepHeader
				title={titleText}
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
						data-testid="icon-PendingTransaction"
						className={cn({
							"text-theme-primary-600": !isConfirmed,
							"text-theme-success-600": isConfirmed,
						})}
					/>
				}
			/>

			<div className="mt-8">
				<TransactionId transaction={transaction} />
			</div>

			<div className="mt-6 space-y-8">
				<TransactionDetailPadded>
					<TransactionAddresses
						network={senderWallet.network()}
						senderAddress={senderWallet.address()}
						recipients={recipients}
						profile={senderWallet.profile()}
					/>
				</TransactionDetailPadded>

				{!transaction.isVote() && (
					<TransactionDetailPadded>
						<TransactionType transaction={transaction} />
					</TransactionDetailPadded>
				)}

				{children}

				<TransactionDetailPadded>
					<DetailLabel>{t("TRANSACTION.CONFIRMATIONS")}</DetailLabel>
					<div className="mt-2">
						<TransactionConfirmations isConfirmed={isConfirmed} confirmations={confirmations} />
					</div>
				</TransactionDetailPadded>
			</div>
		</section>
	);
};
