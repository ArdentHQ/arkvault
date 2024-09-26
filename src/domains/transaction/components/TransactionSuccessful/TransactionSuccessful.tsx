import cn from "classnames";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { TransactionDetailContent } from "../TransactionDetailModal";

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
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	const { isConfirmed } = useConfirmedTransaction({
		transactionId: transaction.id(),
		wallet: senderWallet,
	});

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

			<TransactionDetailContent transactionItem={transaction} profile={senderWallet.profile()} />
		</section>
	);
};
