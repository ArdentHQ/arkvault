import cn from "classnames";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { TransactionDetailContent } from "@/domains/transaction/components/TransactionDetailSidePanel";
import { useProfileTokens } from "@/domains/tokens/hooks/use-profile-tokens";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";

interface TransactionSuccessfulProperties {
	transaction: ExtendedTransactionDTO;
	senderWallet: Contracts.IReadWriteWallet;
	children?: React.ReactNode;
	noHeading?: boolean;
	skipConfirmationCheck?: boolean;
}

export const TransactionSuccessful = ({
	transaction,
	senderWallet,
	noHeading = false,
	skipConfirmationCheck = false,
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	const { isConfirmed, transaction: confirmedTransaction } = useConfirmedTransaction({
		skipConfirmationCheck,
		transactionId: transaction.hash(),
		wallet: senderWallet,
	});

	const titleText = isConfirmed ? t("TRANSACTION.SUCCESS.CONFIRMED") : t("TRANSACTION.SUCCESS.CREATED");

	const { tokens } = useProfileTokens({ profile: senderWallet.profile() });
	const token = tokens.find((token) => token.token().address() === transaction.to());

	return (
		<section data-testid={isConfirmed ? "TransactionSuccessful" : "TransactionPending"}>
			{!noHeading && (
				<StepHeader
					title={titleText}
					titleIcon={
						<Icon
							dimensions={[24, 24]}
							name={isConfirmed ? "CheckmarkDoubleCircle" : "UnconfirmedTransaction"}
							data-testid="icon-UnconfirmedTransaction"
							className={cn({
								"text-theme-primary-600": !isConfirmed,
								"text-theme-success-600": isConfirmed,
							})}
						/>
					}
				/>
			)}

			<div
				className={cn({
					"mt-4": !noHeading,
				})}
			>
				<TransactionDetailContent
					token={token}
					transactionItem={confirmedTransaction ?? transaction}
					profile={senderWallet.profile()}
					isConfirmed={transaction.confirmations().isGreaterThan(0) || isConfirmed}
					confirmations={confirmedTransaction?.confirmations().toNumber() ?? transaction.confirmations().toNumber()}
					containerClassname="-mx-3 sm:mx-0"
				/>
			</div>
		</section>
	);
};
