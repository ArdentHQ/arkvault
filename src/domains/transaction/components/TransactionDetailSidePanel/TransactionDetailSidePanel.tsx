import { DetailLabel, DetailPadded, DetailsCondensed } from "@/app/components/DetailWrapper";
import React, { useEffect, useState } from "react";
import {
	TransactionAddresses,
	TransactionConfirmations,
	TransactionDetails,
	TransactionSummary,
	TransactionType,
	TransactionGas,
} from "@/domains/transaction/components/TransactionDetail";

import { Contracts } from "@/app/lib/profiles";
import { DTO } from "@/app/lib/mainsail";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { TransactionDetailModalProperties } from "./TransactionDetailSidePanel.contracts";
import { TransactionId } from "@/domains/transaction/components/TransactionDetail/TransactionId";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import cn from "classnames";
import { isContractDeployment } from "@/domains/transaction/utils";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { useTransactionRecipients } from "@/domains/transaction/hooks/use-transaction-recipients";
import { useTransactionVotingWallets } from "@/domains/transaction/hooks/use-transaction-voting-wallets";
import { useTranslation } from "react-i18next";

export const TransactionDetailContent = ({
	transactionItem: transaction,
	profile,
	isConfirmed,
	confirmations,
	containerClassname,
	allowHideBalance = false,
}: {
	transactionItem: DTO.RawTransactionData;
	profile: Contracts.IProfile;
	isConfirmed?: boolean;
	confirmations?: number;
	containerClassname?: string;
	allowHideBalance?: boolean;
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
				<DetailPadded className="flex-1 sm:ml-0">
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

				<DetailPadded className="flex-1 sm:ml-0">
					{!isVoteTransaction && <TransactionType transaction={transaction} />}
					{isVoteTransaction && <VoteTransactionType votes={votes} unvotes={unvotes} showValidator />}
				</DetailPadded>

				<DetailPadded className="flex-1 sm:ml-0">
					<TransactionSummary
						labelClassName={labelClassName}
						transaction={transaction}
						senderWallet={transaction.wallet()}
						profile={profile}
						allowHideBalance={allowHideBalance}
					/>
				</DetailPadded>

				<DetailPadded className="flex-1 sm:ml-0">
					<TransactionDetails
						isConfirmed={isConfirmed}
						transaction={transaction}
						labelClassName={labelClassName}
					/>
				</DetailPadded>

				<DetailPadded className="flex-1 sm:ml-0">
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

			<div className="-mx-3 mt-6 sm:mx-0">
				<DetailLabel className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50">
					{t("TRANSACTION.MORE_DETAILS")}
				</DetailLabel>

				<DetailPadded className="flex-1 sm:mt-3 sm:ml-0">
					<TransactionGas gasLimit={transaction.gasLimit()} gasUsed={transaction.gasUsed()} />
				</DetailPadded>
			</div>
		</DetailsCondensed>
	);
};

export const TransactionDetailSidePanel = ({
	isOpen: isSidePanelOpen,
	transactionItem,
	profile,
	onClose,
}: TransactionDetailModalProperties) => {
	const { t } = useTranslation();

	const [isOpen, setIsOpen] = useState(isSidePanelOpen);

	const wallet = transactionItem.wallet();
	const transactionId = transactionItem.hash();

	const { isConfirmed, transaction: confirmedTransaction } = useConfirmedTransaction({
		transactionId,
		wallet,
	});

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | undefined;

		if (!isOpen) {
			timeoutId = setTimeout(() => {
				onClose?.();
			}, 1000);
		}

		return () => clearTimeout(timeoutId);
	}, [isOpen]);

	// If already confirmed, skip the hook entirely
	if (transactionItem.isConfirmed()) {
		return (
			<SidePanel title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} open={isOpen} onOpenChange={setIsOpen}>
				<TransactionDetailContent
					transactionItem={transactionItem}
					profile={profile}
					isConfirmed={transactionItem.isConfirmed()}
					confirmations={transactionItem.confirmations().toNumber()}
					allowHideBalance
					containerClassname="-mx-3 sm:mx-0"
				/>
			</SidePanel>
		);
	}

	const transactionToShow = confirmedTransaction ?? transactionItem;
	const confirmationsToShow = confirmedTransaction
		? confirmedTransaction.confirmations().toNumber()
		: transactionItem.confirmations().toNumber();
	const isConfirmedToShow = isConfirmed;

	return (
		<SidePanel title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} open={isOpen} onOpenChange={setIsOpen}>
			<TransactionDetailContent
				transactionItem={transactionToShow}
				profile={profile}
				isConfirmed={isConfirmedToShow}
				confirmations={confirmationsToShow}
				allowHideBalance
				containerClassname="-mx-3 sm:mx-0"
			/>
		</SidePanel>
	);
};
