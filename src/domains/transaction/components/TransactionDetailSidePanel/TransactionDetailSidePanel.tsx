import { DetailLabel, DetailPadded, DetailsCondensed } from "@/app/components/DetailWrapper";
import React, { useEffect, useMemo, useState } from "react";
import {
	TransactionAddresses,
	TransactionConfirmations,
	TransactionDetails,
	TransactionGas,
	TransactionSummary,
	TransactionType,
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
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokensTransferred } from "@/domains/transaction/components/TransactionDetail/TokensTransferred";
import { transaction } from "@/domains/transaction/images";

export const TransactionDetailContent = ({
	transactionItem: transaction,
	profile,
	isConfirmed,
	confirmations,
	containerClassname,
	allowHideBalance = false,
	token,
	isRefreshingTransaction,
}: {
	transactionItem: DTO.RawTransactionData;
	profile: Contracts.IProfile;
	isConfirmed?: boolean;
	confirmations?: number;
	containerClassname?: string;
	allowHideBalance?: boolean;
	token?: WalletToken;
	isRefreshingTransaction?: boolean;
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

	const interactedWith: string | undefined = useMemo(() => {
		if (isContractDeployment(transaction) && transaction.confirmations() > 0) {
			return transaction.data().data.receipt.deployedContractAddress;
		}

		if ("token" in transaction && transaction.token()) {
			return transaction.token().token().address();
		}
	}, [transaction]);

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
						interactedWith={interactedWith}
					/>
				</DetailPadded>

				<DetailPadded className="flex-1 sm:ml-0">
					{!isVoteTransaction && <TransactionType transaction={transaction} />}
					{isVoteTransaction && <VoteTransactionType votes={votes} unvotes={unvotes} showValidator />}
				</DetailPadded>

				{transaction.isTokenTransfer() && (
					<DetailPadded className="flex-1 sm:ml-0">
						<TokensTransferred
							isRefreshingTransaction={isRefreshingTransaction}
							token={transaction.token()?.token()}
							labelClassName={labelClassName}
							transaction={transaction}
							senderWallet={transaction.wallet()}
							profile={profile}
							allowHideBalance={allowHideBalance}
						/>
					</DetailPadded>
				)}

				<DetailPadded className="flex-1 sm:ml-0">
					<TransactionSummary
						token={token?.token()}
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

			<div className={cn("mt-6", containerClassname)}>
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

	const {
		isConfirmed,
		isLoading,
		transaction: confirmedTransaction,
	} = useConfirmedTransaction({
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

	const transactionToShow = confirmedTransaction ?? transactionItem;

	return (
		<SidePanel title={t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")} open={isOpen} onOpenChange={setIsOpen}>
			<TransactionDetailContent
				transactionItem={transactionToShow}
				profile={profile}
				isConfirmed={transactionToShow.isConfirmed()}
				confirmations={transactionToShow.confirmations().toNumber()}
				allowHideBalance
				containerClassname="-mx-3 sm:mx-0"
				isRefreshingTransaction={isLoading}
			/>
		</SidePanel>
	);
};
