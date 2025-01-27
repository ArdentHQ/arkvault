import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { Page, Section } from "@/app/components/Layout";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks/env";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";
import { Transactions } from "@/domains/transaction/components/Transactions";
import { Tab, TabList, Tabs, TabScroll } from "@/app/components/Tabs";
import { TabId } from "@/app/components/Tabs/useTab";
import { WalletHeader } from "@/domains/wallet/pages/WalletDetails/components/WalletHeader";
import { WalletVote } from "@/domains/wallet/pages/WalletDetails/components";
import { DashboardEmpty } from "./Dashboard.Empty";

export const Dashboard = () => {
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData>();

	const [isUpdatingTransactions, setIsUpdatingTransactions] = useState(false);
	const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);

	const history = useHistory();
	const { t } = useTranslation();

	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const activeWallet = activeProfile.wallets().first() as Contracts.IReadWriteWallet | undefined;
	const { profileIsSyncing } = useConfiguration();

	const networkAllowsVoting = useMemo(() => activeWallet?.network().allowsVoting(), [activeWallet]);

	const handleVoteButton = (filter?: string) => {
		/* istanbul ignore else -- @preserve */
		if (filter) {
			return history.push({
				pathname: `/profiles/${activeProfile.id()}/wallets/${activeWallet?.id()}/votes`,
				search: `?filter=${filter}`,
			});
		}

		history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet?.id()}/votes`);
	};

	const [mobileActiveTab, setMobileActiveTab] = useState<TabId>("transactions");

	const [isLoadingVotes, setIsLoadingVotes] = useState(true);

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);

	useEffect(() => {
		const syncVotes = async () => {
			try {
				if (!activeWallet) {
					return;
				}

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

	if (!activeWallet) {
		if (activeProfile.status().isRestored() && !profileIsSyncing) {
			return (
				<Page pageTitle={t("COMMON.WELCOME")}>
					<DashboardEmpty />
				</Page>
			);
		}
		return <div />;
	}

	return (
		<>
			<Page pageTitle={activeWallet.address()}>
				<Section
					className="pb-0 first:pt-0 md:px-0 md:pb-4 xl:mx-auto"
					innerClassName="m-0 p-0 md:px-0 md:mx-auto"
				>
					<WalletHeader
						profile={activeProfile}
						wallet={activeWallet}
						votes={votes}
						handleVotesButtonClick={handleVoteButton}
						isLoadingVotes={isLoadingVotes}
						isUpdatingTransactions={isUpdatingTransactions}
						onUpdate={setIsUpdatingWallet}
					/>
				</Section>

				<Tabs className="md:hidden" activeId={mobileActiveTab} onChange={setMobileActiveTab}>
					<TabScroll>
						<TabList className="h-[48px]">
							<Tab tabId="transactions">
								<span className="whitespace-nowrap">{t("COMMON.TRANSACTIONS")}</span>
							</Tab>
							{networkAllowsVoting && (
								<Tab tabId="votes">
									<span className="whitespace-nowrap">{t("COMMON.VOTING")}</span>
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
						className={cn("md:hidden", {
							hidden: mobileActiveTab !== "votes",
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

				<Section className="flex-1 !pt-2">
					<div
						className={cn({
							"hidden md:block": mobileActiveTab !== "transactions",
						})}
					>
						<Transactions
							profile={activeProfile}
							wallets={[activeWallet]}
							isLoading={profileIsSyncing}
							isUpdatingWallet={isUpdatingWallet}
							onLoading={setIsUpdatingTransactions}
						/>
					</div>
				</Section>
			</Page>

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
