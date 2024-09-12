/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { WalletHeader, WalletHeaderMobile, WalletVote } from "./components";
import { useWalletTransactions } from "./hooks/use-wallet-transactions";
import { Page, Section } from "@/app/components/Layout";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useActiveWallet } from "@/app/hooks/env";
import { toasts } from "@/app/services";
import { MultiSignatureDetail } from "@/domains/transaction/components/MultiSignatureDetail";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";
import { Transactions } from "@/domains/transaction/components/Transactions";
import { PendingTransactions } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable";
import { useBreakpoint } from "@/app/hooks";
import { Tab, TabList, Tabs, TabScroll } from "@/app/components/Tabs";
import { TabId } from "@/app/components/Tabs/useTab";

export const WalletDetails = () => {
	const [signedTransactionModalItem, setSignedTransactionModalItem] = useState<DTO.ExtendedSignedTransactionData>();
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData>();

	const [isUpdatingTransactions, setIsUpdatingTransactions] = useState(false);
	const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);

	const history = useHistory();
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWallet();
	const { profileIsSyncing } = useConfiguration();

	const networkAllowsVoting = useMemo(() => activeWallet.network().allowsVoting(), [activeWallet]);
	const { pendingTransactions, syncPending, startSyncingPendingTransactions, stopSyncingPendingTransactions } =
		useWalletTransactions(activeWallet);

	useEffect(() => {
		syncPending();
		startSyncingPendingTransactions();
		return () => {
			stopSyncingPendingTransactions();
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

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
		await syncPending();
		toasts.success(t("TRANSACTION.TRANSACTION_REMOVED"));
	}, [syncPending, t]);

	const [mobileActiveTab, setMobileActiveTab] = useState<TabId>("transactions");

	const [isLoadingVotes, setIsLoadingVotes] = useState(true);

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);

	useEffect(() => {
		const syncVotes = async () => {
			try {
				await env.delegates().sync(activeProfile, activeWallet?.coinId(), activeWallet?.networkId());
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
				{isXs && (
					<Section
						className={cn("first:pt-0 last:pb-6", {
							"border-b border-transparent dark:border-theme-secondary-800": !networkAllowsVoting,
						})}
						innerClassName="p-0"
						backgroundClassName="bg-theme-secondary-900"
					>
						<WalletHeaderMobile
							profile={activeProfile}
							wallet={activeWallet}
							onUpdate={setIsUpdatingWallet}
						/>
					</Section>
				)}

				{!isXs && (
					<Section
						className={cn("!pb-8 first:pt-8 last:pb-8", {
							"border-b border-transparent dark:border-theme-secondary-800": !networkAllowsVoting,
						})}
						backgroundClassName="bg-theme-secondary-900"
					>
						<WalletHeader
							profile={activeProfile}
							wallet={activeWallet}
							onUpdate={setIsUpdatingWallet}
							isUpdatingTransactions={isUpdatingTransactions}
						/>
					</Section>
				)}

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

				{networkAllowsVoting && (
					<Section
						borderClassName="border-transparent dark:border-transaparent md:border-theme-secondary-300 md:dark:border-transparent"
						backgroundClassName="md:bg-theme-background md:dark:bg-theme-secondary-background"
						innerClassName="md:-my-2 w-full"
						border
						className={cn({
							"hidden md:flex": mobileActiveTab !== "votes",
						})}
					>
						<WalletVote
							isLoadingVotes={isLoadingVotes}
							votes={votes}
							wallet={activeWallet}
							onButtonClick={handleVoteButton}
						/>
					</Section>
				)}

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
						syncPending();
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
