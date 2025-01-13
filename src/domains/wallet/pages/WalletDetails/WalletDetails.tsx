/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { useWalletTransactions } from "./hooks/use-wallet-transactions";
import { Page, Section } from "@/app/components/Layout";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useActiveWallet } from "@/app/hooks/env";
import { toasts } from "@/app/services";
import { MultiSignatureDetail } from "@/domains/transaction/components/MultiSignatureDetail";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";
import { Transactions } from "@/domains/transaction/components/Transactions";
import { PendingTransactions } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable";
import { Tab, TabList, Tabs, TabScroll } from "@/app/components/Tabs";
import { TabId } from "@/app/components/Tabs/useTab";
import { WalletHeader } from "./components/WalletHeader";

export const WalletDetails = () => {
	const [signedTransactionModalItem, setSignedTransactionModalItem] = useState<DTO.ExtendedSignedTransactionData>();
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData>();

	const [isUpdatingTransactions, setIsUpdatingTransactions] = useState(false);
	const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);

	const history = useHistory();
	const { t } = useTranslation();

	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWallet();
	const { profileIsSyncing } = useConfiguration();

	const networkAllowsVoting = useMemo(() => activeWallet.network().allowsVoting(), [activeWallet]);
	const { pendingTransactions } = useWalletTransactions(activeWallet);

	const handleVoteButton = (filter?: string) => {
		/* istanbul ignore else -- @preserve */
		if (filter) {
			return history.push({
				pathname: `/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}/votes`,
				search: `?filter=${filter}`,
			});
		}

		history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}/votes`);
	};

	const onPendingTransactionRemove = useCallback(async () => {
		toasts.success(t("TRANSACTION.TRANSACTION_REMOVED"));
	}, [t]);

	const [mobileActiveTab, setMobileActiveTab] = useState<TabId>("transactions");

	const [isLoadingVotes, setIsLoadingVotes] = useState(true);

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);

	useEffect(() => {
		const syncVotes = async () => {
			try {
				await env.delegates().sync(activeProfile, activeWallet.coinId(), activeWallet.networkId());
				await activeWallet.synchroniser().votes();

				setVotes(activeWallet.voting().current());
			} catch {
				// TODO: Retry sync if error code is greater than 499. Needs status code number from sdk.
			}

			setIsLoadingVotes(false);
		};

		syncVotes();
	}, [activeWallet, env, activeProfile]);

	useEffect(() => {
		if (!isUpdatingTransactions) {
			setIsUpdatingWallet(false);
		}
	}, [isUpdatingTransactions]);

	const maxVotes = activeWallet.network().maximumVotesPerWallet();

	const hasPendingTransactions = useMemo(() => pendingTransactions.length > 0, [pendingTransactions]);

	return (
		<>
			<Page pageTitle={activeWallet.address()}>
				<Section className="px-0 first:pt-0 md:px-0 xl:mx-auto" innerClassName="m-0 p-0 md:px-0 md:mx-auto">
					<WalletHeader
						profile={activeProfile}
						wallet={activeWallet}
						onUpdate={setIsUpdatingWallet}
						votes={votes}
						handleVotesButtonClick={handleVoteButton}
						isLoadingVotes={isLoadingVotes}
					/>
				</Section>

				<Tabs className="md:hidden" activeId={mobileActiveTab} onChange={setMobileActiveTab}>
					<TabScroll>
						<TabList className="h-[52px]">
							<Tab tabId="transactions">
								<span className="whitespace-nowrap">{t("COMMON.TRANSACTION_HISTORY")}</span>
							</Tab>
							{networkAllowsVoting && (
								<Tab tabId="votes">
									<span className="whitespace-nowrap">
										{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.TITLE", { count: maxVotes })}
										<span className="ml-1 text-theme-secondary-500 dark:text-theme-secondary-700">
											{votes.length}/{maxVotes}
										</span>
									</span>
								</Tab>
							)}
							{hasPendingTransactions && (
								<Tab tabId="pending">
									<span className="whitespace-nowrap">
										{t("WALLETS.PAGE_WALLET_DETAILS.PENDING_TRANSACTIONS")}
										<span className="ml-1 text-theme-secondary-500 dark:text-theme-secondary-700">
											({pendingTransactions.length})
										</span>
									</span>
								</Tab>
							)}
						</TabList>
					</TabScroll>
				</Tabs>

				<Section className="flex-1 pt-6">
					{hasPendingTransactions && (
						<div
							className={cn("md:mb-8", {
								"hidden md:block": mobileActiveTab !== "pending",
							})}
						>
							<PendingTransactions
								profile={activeProfile}
								pendingTransactions={pendingTransactions}
								wallet={activeWallet}
								onPendingTransactionClick={setTransactionModalItem}
								onClick={setSignedTransactionModalItem}
								onRemove={onPendingTransactionRemove}
							/>
						</div>
					)}

					<div
						className={cn({
							"hidden md:block": mobileActiveTab !== "transactions",
						})}
					>
						<Transactions
							title={t("COMMON.TRANSACTION_HISTORY")}
							profile={activeProfile}
							wallets={[activeWallet]}
							isLoading={profileIsSyncing}
							isUpdatingWallet={isUpdatingWallet}
							onLoading={setIsUpdatingTransactions}
						/>
					</div>
				</Section>
			</Page>

			{signedTransactionModalItem && (
				<MultiSignatureDetail
					profile={activeProfile}
					wallet={activeWallet}
					isOpen={!!signedTransactionModalItem}
					transaction={signedTransactionModalItem}
					onClose={async () => {
						setSignedTransactionModalItem(undefined);
					}}
				/>
			)}

			{transactionModalItem && (
				<TransactionDetailModal
					isOpen={!!transactionModalItem}
					transactionItem={transactionModalItem}
					profile={activeProfile}
					onClose={() => setTransactionModalItem(undefined)}
				/>
			)}
		</>
	);
};
