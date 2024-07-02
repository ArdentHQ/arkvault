import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Circle } from "@/app/components/Circle";
import { Clipboard } from "@/app/components/Clipboard";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useEnvironmentContext } from "@/app/contexts";
import {
	TransactionAmount,
	TransactionDetail,
	TransactionFee,
	TransactionMultisignatureStatus,
	TransactionRecipients,
	TransactionSender,
	TransactionTimestamp,
	TransactionVotes,
} from "@/domains/transaction/components/TransactionDetail";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";

import { getMultiSignatureInfo } from "./MultiSignatureDetail.helpers";
import { Signatures } from "./Signatures";

export const SummaryStep = ({
	wallet,
	transaction,
}: {
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}) => {
	const { env } = useEnvironmentContext();
	const { t } = useTranslation();

	const { getLabel } = useTransactionTypes();
	const { status } = useMultiSignatureStatus({ transaction, wallet });

	const reference = useRef(null);

	const type = transaction.type();
	let recipients: any;
	let transactionAmount: number;

	if (transaction.isTransfer() || transaction.isMultiPayment()) {
		recipients = transaction.recipients();
		transactionAmount = transaction.amount();
	}

	const [delegates, setDelegates] = useState<{
		votes: Contracts.IReadOnlyWallet[];
		unvotes: Contracts.IReadOnlyWallet[];
	}>({
		unvotes: [],
		votes: [],
	});

	useEffect(() => {
		const findVoteDelegates = () => {
			if (["vote", "unvote"].includes(type)) {
				const asset = transaction.get<{ votes: string[] }>("asset");
				const votes = asset.votes.filter((vote) => vote.startsWith("+")).map((s) => s.slice(1));
				const unvotes = asset.votes.filter((vote) => vote.startsWith("-")).map((s) => s.slice(1));

				setDelegates({
					unvotes: env.delegates().map(wallet, unvotes),
					votes: env.delegates().map(wallet, votes),
				});
			}
		};

		findVoteDelegates();
	}, [env, wallet, transaction, type]);

	const { publicKeys, min } = getMultiSignatureInfo(transaction);

	return (
		<section>
			<Header title={getLabel(type)} />

			<TransactionSender address={transaction.sender()} network={wallet.network()} border={false} />

			{recipients && <TransactionRecipients currency={wallet.currency()} recipients={recipients} />}

			{(transaction.isTransfer() || transaction.isMultiPayment()) && (
				<TransactionAmount
					amount={transactionAmount!}
					currency={wallet.currency()}
					isTotalAmount={recipients.length > 1}
					isSent={true}
				/>
			)}

			{(type === "vote" || type === "unvote") && <TransactionVotes {...delegates} currency={wallet.currency()} />}

			{type === "ipfs" && (
				<TransactionDetail
					label={t("TRANSACTION.IPFS_HASH")}
					extra={
						<Circle
							className="flex-shrink-0 border-theme-text text-theme-text dark:border-theme-secondary-600 dark:text-theme-secondary-600"
							size="lg"
						>
							<Icon name="Ipfs" size="lg" />
						</Circle>
					}
				>
					{transaction.get<{ hash: string }>("asset").hash}
				</TransactionDetail>
			)}

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.MIN_SIGNATURES")}>
				{min} / {publicKeys.length}
			</TransactionDetail>

			<TransactionMultisignatureStatus
				status={status}
				address={transaction.sender()}
				network={wallet.network()}
			/>

			<TransactionDetail label={t("TRANSACTION.ID")}>
				<div className="flex flex-1 items-center space-x-3">
					<span ref={reference} className="w-20 flex-1 overflow-hidden">
						<TruncateMiddleDynamic value={transaction.id()} parentRef={reference} />
					</span>

					<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
						<Clipboard variant="icon" data={transaction.id()}>
							<Icon name="Copy" />
						</Clipboard>
					</span>
				</div>
			</TransactionDetail>

			<div className="-mx-10 mt-4 border-t border-theme-secondary-300 px-10 pt-6 dark:border-theme-secondary-800">
				<Signatures transaction={transaction} wallet={wallet} />
			</div>
		</section>
	);
};
