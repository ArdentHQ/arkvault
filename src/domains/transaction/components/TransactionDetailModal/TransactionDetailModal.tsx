import React from "react";
import { TransactionDetailModalProperties } from "./TransactionDetailModal.contracts";
import { useTranslation } from "react-i18next";
import { transactionPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";

import { Modal } from "@/app/components/Modal";
import {
	TransactionAddresses,
	TransactionType,
	TransactionSummary,
	TransactionDetails,
	TransactionConfirmations,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionId } from "@/domains/transaction/components/TransactionDetail/TransactionId";

import { DetailLabel, DetailPadded, DetailsCondensed, DetailWrapper } from "@/app/components/DetailWrapper";
import { useTransactionVotingWallets } from "@/domains/transaction/hooks/use-transaction-voting-wallets";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import { TransactionMusigParticipants } from "@/domains/transaction/components/TransactionDetail/TransactionMusigParticipants";
import { useTransactionRecipients } from "@/domains/transaction/hooks/use-transaction-recipients";
import cn from "classnames";
import { Contracts, } from "@ardenthq/sdk-profiles";
import { DTO } from "@ardenthq/sdk";
import { Signatures } from "../MultiSignatureDetail/Signatures";

const isAwaitingMusigSignatures = (transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData) => {
	if (transaction.isConfirmed() ?? !transaction.confirmations().isZero()) {
		return false
	}

	return !transaction.wallet().transaction().hasBeenBroadcasted(transaction.id())
}

export const TransactionDetailContent = ({
	transactionItem: transaction,
	profile,
	isConfirmed,
	confirmations,
}: {
	transactionItem: DTO.RawTransactionData;
	profile: Contracts.IProfile;
	isConfirmed?: boolean
	confirmations,
}) => {
	const { t } = useTranslation();

	const isVoteTransaction = [transaction.isVote(), transaction.isVoteCombination(), transaction.isUnvote()].some(
		Boolean,
	);
	const { votes, unvotes } = useTransactionVotingWallets({
		network: transaction.wallet().network(),
		profile,
		transaction,
	});
	const { recipients } = useTransactionRecipients({ profile, transaction });

	const labelClassName = cn({
		"min-w-24": !transaction.isVoteCombination(),
		"min-w-32": transaction.isVoteCombination(),
	});

	const isAwaitingSignatures = isAwaitingMusigSignatures(transaction)

	return (
		<DetailsCondensed>
			<div className="mt-4">
				<TransactionId transaction={transaction} />
			</div>

			<div className="mt-6 space-y-4">
				<DetailPadded>
					<TransactionAddresses
						explorerLink={transaction.explorerLink()}
						profile={profile}
						senderAddress={transaction.sender()}
						network={transaction.wallet().network()}
						recipients={recipients.map(({ address, alias, isDelegate }) => ({
							address,
							alias,
							isDelegate,
						}))}
						labelClassName={labelClassName}
					/>
				</DetailPadded>

				<DetailPadded>
					{!isVoteTransaction && <TransactionType transaction={transaction} />}
					{isVoteTransaction && <VoteTransactionType votes={votes} unvotes={unvotes} />}
				</DetailPadded>

				<DetailPadded>
					<TransactionSummary
						labelClassName={labelClassName}
						transaction={transaction}
						senderWallet={transaction.wallet()}
					/>
				</DetailPadded>

				<DetailPadded>
					<TransactionDetails transaction={transaction} labelClassName={labelClassName} />
				</DetailPadded>

				{[!!transaction.memo(), transaction.isMultiPayment(), transaction.isTransfer()].some(Boolean) && (
					<DetailPadded>
						<DetailWrapper label={t("COMMON.MEMO_SMARTBRIDGE")}>
							{transaction.memo() && <p>{transaction.memo()}</p>}
							{!transaction.memo() && (
								<p className="text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</p>
							)}
						</DetailWrapper>
					</DetailPadded>
				)}

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

				{[!isAwaitingSignatures, transaction.isMultiSignatureRegistration()].every(Boolean) && (
					<DetailPadded>
						<DetailLabel>{t("TRANSACTION.PARTICIPANTS")}</DetailLabel>
						<div className="mt-2">
							<TransactionMusigParticipants
								publicKeys={transactionPublicKeys(transaction).publicKeys}
								useExplorerLinks
								profile={profile}
								network={transaction.wallet().network()}
							/>
						</div>
					</DetailPadded>
				)}

				{[isAwaitingSignatures].every(Boolean) && (
					<DetailPadded>
						<DetailLabel>{t("TRANSACTION.SIGNATURES")}</DetailLabel>
						<div className="mt-2">
							<Signatures
								publicKeys={transactionPublicKeys(transaction).publicKeys}
								profile={profile}
								transaction={transaction}
							/>
						</div>
					</DetailPadded>
				)}
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
	return <Modal title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
		<TransactionDetailContent transactionItem={transactionItem} profile={profile} />
	</Modal>
};
