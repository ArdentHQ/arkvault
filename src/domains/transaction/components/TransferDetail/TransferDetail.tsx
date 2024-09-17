import React from "react";
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

import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { DetailLabel, DetailWrapper } from "@/app/components/DetailWrapper";
import { TransactionDetailPadded } from "@/domains/transaction/components/TransactionSuccessful";
import { useTransactionVotingWallets } from "@/domains/transaction/hooks/use-transaction-voting-wallets";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";

export const TransferDetail = ({ isOpen, aliases, transaction, onClose, profile }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const isVoteTransaction = [transaction.isVote(), transaction.isVoteCombination(), transaction.isUnvote()].some(Boolean)
	const { votes, unvotes } = useTransactionVotingWallets({ network: transaction.wallet().network(), profile, transaction })

	return (
		<Modal title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
			<div className="mt-4">
				<TransactionId transaction={transaction} />
			</div>

			<div className="mt-6 space-y-8">
				<TransactionDetailPadded>
					<TransactionAddresses
						explorerLink={transaction.explorerLink()}
						profile={profile}
						senderAddress={transaction.sender()}
						network={transaction.wallet().network()}
						recipients={aliases?.recipients}
					/>
				</TransactionDetailPadded>

				<TransactionDetailPadded>
					{!isVoteTransaction && <TransactionType transaction={transaction} />}
					{isVoteTransaction && <VoteTransactionType votes={votes} unvotes={unvotes} />}
				</TransactionDetailPadded>

				<TransactionDetailPadded>
					<TransactionSummary transaction={transaction} senderWallet={transaction.wallet()} />
				</TransactionDetailPadded>

				<TransactionDetailPadded>
					<TransactionDetails transaction={transaction} />
				</TransactionDetailPadded>

				{[!!transaction.memo(), transaction.isMultiPayment(), transaction.isTransfer()].some(Boolean) && (
					<TransactionDetailPadded>
						<DetailWrapper label={t("COMMON.MEMO_SMARTBRIDGE")}>
							{transaction.memo() && <p>{transaction.memo()}</p>}
							{!transaction.memo() && <p className="text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</p>}
						</DetailWrapper>
					</TransactionDetailPadded>
				)}

				<TransactionDetailPadded>
					<DetailLabel>{t("TRANSACTION.CONFIRMATIONS")}</DetailLabel>
					<div className="mt-2">
						<TransactionConfirmations
							isConfirmed={transaction.isConfirmed()}
							confirmations={transaction.confirmations().toNumber()}
						/>
					</div>
				</TransactionDetailPadded>
			</div>
		</Modal>
	);
};

TransferDetail.displayName = "TransferDetail";
