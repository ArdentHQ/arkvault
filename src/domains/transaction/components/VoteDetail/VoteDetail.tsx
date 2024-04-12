import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { useEnvironmentContext } from "@/app/contexts";
import {
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
	TransactionVotes,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";

export const VoteDetail = ({ isOpen, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	const [isLoadingDelegates, setIsLoadingDelegates] = useState(true);
	const [delegates, setDelegates] = useState<{
		votes: Contracts.IReadOnlyWallet[];
		unvotes: Contracts.IReadOnlyWallet[];
	}>({
		unvotes: [],
		votes: [],
	});

	useEffect(() => {
		const syncDelegates = () => {
			setIsLoadingDelegates(true);

			setDelegates({
				unvotes: env.delegates().map(wallet, transaction.unvotes()),
				votes: env.delegates().map(wallet, transaction.votes()),
			});

			setIsLoadingDelegates(false);
		};

		syncDelegates();

		return () => {
			setIsLoadingDelegates(false);
			setDelegates({ unvotes: [], votes: [] });
		};
	}, [env, wallet, transaction, isOpen]);

	return (
		<Modal
			title={selectDelegateValidatorTranslation({
				delegateStr: t("TRANSACTION.MODAL_VOTE_DETAIL.TITLE_DELEGATE"),
				network: wallet.network(),
				validatorStr: t("TRANSACTION.MODAL_VOTE_DETAIL.TITLE"),
			})}
			isOpen={isOpen}
			onClose={onClose}
			noButtons
		>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			<TransactionVotes isLoading={isLoadingDelegates} {...delegates} currency={wallet.currency()} />

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionStatus transaction={transaction} />

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};

VoteDetail.displayName = "VoteDetail";
