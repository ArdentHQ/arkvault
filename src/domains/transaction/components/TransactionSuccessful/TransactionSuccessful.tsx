import cn from "classnames";
import { Contracts, DTO } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { TransactionDetailContent } from "@/domains/transaction/components/TransactionDetailSidePanel";

interface TransactionSuccessfulProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	children?: React.ReactNode;
	noHeading?: boolean;
}

export const TransactionSuccessful = ({
	transaction,
	senderWallet,
	noHeading = false,
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	const { isConfirmed, transaction: confirmedTransaction } = useConfirmedTransaction({
		transactionId: transaction.hash(),
		wallet: senderWallet,
	});

	const titleText = isConfirmed ? t("TRANSACTION.SUCCESS.CONFIRMED") : t("TRANSACTION.SUCCESS.CREATED");

	return (
		<section data-testid={isConfirmed ? "TransactionSuccessful" : "TransactionPending"}>
			{!noHeading && (
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
			)}

			<div className="mt-4">
				<TransactionDetailContent
					transactionItem={confirmedTransaction ?? transaction}
					profile={senderWallet.profile()}
					isConfirmed={isConfirmed}
					confirmations={confirmedTransaction?.confirmations().toNumber() ?? 0}
					containerClassname="-mx-3 sm:mx-0"
				/>
			</div>
		</section>
	);
};
