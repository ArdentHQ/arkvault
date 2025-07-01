import React from "react";
import { TransactionDetailModalProperties } from "./TransactionDetailModal.contracts";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
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
			<div className="mt-4">
				<TransactionId transaction={transaction} isConfirmed={isConfirmed} />
			</div>

			<div className={cn("mt-6 space-y-3 sm:space-y-4", containerClassname)}>
				<DetailPadded>
					<TransactionAddresses
						explorerLink={transaction.explorerLink()}
						profile={profile}
						senderAddress={transaction.from()}
						network={transaction.wallet().network()}
						recipients={recipients}
						labelClassName={labelClassName}
						interactedWith={
							isContractDeployment(transaction)
								? transaction.data().data.receipt.deployedContractAddress
								: undefined
						}
					/>
				</DetailPadded>

				<DetailPadded>
					{!isVoteTransaction && <TransactionType transaction={transaction} />}
					{isVoteTransaction && <VoteTransactionType votes={votes} unvotes={unvotes} showValidator />}
				</DetailPadded>

				<DetailPadded>
					<TransactionSummary
						labelClassName={labelClassName}
						transaction={transaction}
						senderWallet={transaction.wallet()}
						profile={profile}
					/>
				</DetailPadded>

				<DetailPadded>
					<TransactionDetails
						isConfirmed={isConfirmed}
						transaction={transaction}
						labelClassName={labelClassName}
					/>
				</DetailPadded>

				<DetailPadded>
					<DetailLabel>{t("TRANSACTION.CONFIRMATIONS")}</DetailLabel>
					<div className="mt-2">
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

export const TransactionDetailModal = ({
	isOpen,
	transactionItem,
	profile,
	onClose,
}: TransactionDetailModalProperties) => {
	const { t } = useTranslation();
	return (
		<Modal title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
			<TransactionDetailContent transactionItem={transactionItem} profile={profile} />
		</Modal>
	);
};
