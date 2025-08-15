import React from "react";
import { TransactionDetailModalProperties } from "./TransactionDetailSidePanel.contracts";
import { useTranslation } from "react-i18next";

import {
	TransactionAddresses,
	TransactionType,
	TransactionSummary,
	TransactionDetails,
	TransactionConfirmations,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionId } from "@/domains/transaction/components/TransactionDetail/TransactionId";

import { DetailLabel, DetailPadded, DetailsCondensed } from "@/app/components/DetailWrapper";
import { useTransactionVotingWallets } from "@/domains/transaction/hooks/use-transaction-voting-wallets";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import { useTransactionRecipients } from "@/domains/transaction/hooks/use-transaction-recipients";
import cn from "classnames";
import { Contracts } from "@/app/lib/profiles";
import { DTO } from "@/app/lib/mainsail";
import { isContractDeployment } from "@/domains/transaction/utils";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";

export const TransactionDetailContent = ({
	transactionItem: transaction,
	profile,
	isConfirmed,
	confirmations,
	containerClassname,
}: {
	transactionItem: DTO.RawTransactionData;
	profile: Contracts.IProfile;
	isConfirmed?: boolean;
	confirmations?: number;
	containerClassname?: string;
}) => {
	const { t } = useTranslation();

	const isVoteTransaction = [transaction.isVote(), transaction.isVoteCombination(), transaction.isUnvote()].some(
		Boolean,
	);

	const isValidatorRegistrationOrResignation =
		transaction.isValidatorRegistration() || transaction.isValidatorResignation();

	const { votes, unvotes } = useTransactionVotingWallets({
		profile,
		transaction,
	});

	const { recipients } = useTransactionRecipients({ profile, transaction });

	const labelClassName = cn({
		"min-w-24": !transaction.isVoteCombination() && !isValidatorRegistrationOrResignation,
		"min-w-32": transaction.isVoteCombination() && !isValidatorRegistrationOrResignation,
		"min-w-[138px]": isValidatorRegistrationOrResignation,
	});

	return (
		<DetailsCondensed>
			<TransactionId transaction={transaction} isConfirmed={isConfirmed} />

			<div className={cn("mt-6 space-y-3 sm:space-y-4", containerClassname)}>
				<DetailPadded className="flex-1 -mx-3 sm:ml-0">
					<TransactionAddresses
						explorerLink={transaction.explorerLink()}
						profile={profile}
						senderAddress={transaction.from()}
						network={transaction.wallet().network()}
						isMultiPayment={transaction.isMultiPayment()}
						recipients={recipients}
						labelClassName={labelClassName}
						interactedWith={
							isContractDeployment(transaction)
								? transaction.data().data.receipt.deployedContractAddress
								: undefined
						}
					/>
				</DetailPadded>

				<DetailPadded className="flex-1 -mx-3 sm:ml-0">
					{!isVoteTransaction && <TransactionType transaction={transaction} />}
					{isVoteTransaction && <VoteTransactionType votes={votes} unvotes={unvotes} showValidator />}
				</DetailPadded>

				<DetailPadded className="flex-1 -mx-3 sm:ml-0">
					<TransactionSummary
						labelClassName={labelClassName}
						transaction={transaction}
						senderWallet={transaction.wallet()}
						profile={profile}
					/>
				</DetailPadded>

				<DetailPadded className="flex-1 -mx-3 sm:ml-0">
					<TransactionDetails
						isConfirmed={isConfirmed}
						transaction={transaction}
						labelClassName={labelClassName}
					/>
				</DetailPadded>

				<DetailPadded className="flex-1 -mx-3 sm:ml-0">
					<DetailLabel>{t("TRANSACTION.CONFIRMATIONS")}</DetailLabel>
					<div className="mt-2 px-3 sm:px-0">
						<TransactionConfirmations
							isConfirmed={isConfirmed ?? transaction.isConfirmed()}
							confirmations={confirmations ?? transaction.confirmations().toNumber()}
							transaction={transaction}
						/>
					</div>
				</DetailPadded>
			</div>
		</DetailsCondensed>
	);
};

export const TransactionDetailSidePanel = ({
	isOpen,
	transactionItem,
	profile,
	onClose,
}: TransactionDetailModalProperties) => {
	const { t } = useTranslation();
	return (
		<SidePanel title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} open={isOpen} onOpenChange={onClose}>
			<TransactionDetailContent transactionItem={transactionItem} profile={profile} />
		</SidePanel>
	);
};
