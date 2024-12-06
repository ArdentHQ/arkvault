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

import { DetailLabel, DetailPadded, DetailsCondensed } from "@/app/components/DetailWrapper";
import { useTransactionVotingWallets } from "@/domains/transaction/hooks/use-transaction-voting-wallets";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import { TransactionMusigParticipants } from "@/domains/transaction/components/TransactionDetail/TransactionMusigParticipants";
import { useTransactionRecipients } from "@/domains/transaction/hooks/use-transaction-recipients";
import cn from "classnames";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DTO } from "@ardenthq/sdk";
import { Signatures } from "@/domains/transaction/components/MultiSignatureDetail/Signatures";
import { isAwaitingMusigSignatures } from "@/domains/transaction/hooks";
import { isContractTransaction } from "@/domains/transaction/utils";

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

	const isAwaitingSignatures = isAwaitingMusigSignatures(transaction);

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
						senderAddress={transaction.sender()}
						network={transaction.wallet().network()}
						recipients={recipients.map(({ address, alias, isDelegate }) => ({
							address,
							alias,
							isContract: isContractTransaction(transaction),
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
	return (
		<Modal title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
			<TransactionDetailContent transactionItem={transactionItem} profile={profile} />
		</Modal>
	);
};
