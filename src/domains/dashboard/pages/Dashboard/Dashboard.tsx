import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Page, Section } from "@/app/components/Layout";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks/env";
import { Transactions } from "@/domains/transaction/components/Transactions";
import { Tab, TabList, Tabs, TabScroll } from "@/app/components/Tabs";
import { TabId } from "@/app/components/Tabs/useTab";
import { WalletVote } from "@/domains/wallet/pages/WalletDetails/components";
import { PortfolioHeader } from "@/domains/portfolio/components/PortfolioHeader";

export const Dashboard = ({ hasFocus }: { hasFocus?: boolean }) => {
	const [isUpdatingTransactions, setIsUpdatingTransactions] = useState(false);
	const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);

	const navigate = useNavigate();
	const { t } = useTranslation();

	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const { profileIsSyncing } = useConfiguration().getProfileConfiguration(activeProfile.id());

	const selectedWallets = activeProfile.wallets().selected();
	const selectedWallet = selectedWallets.at(0);

	const handleVoteButton = () => {
		if (selectedWallets.length > 1) {
			navigate({
				pathname: `/profiles/${activeProfile.id()}/votes`,
			});

			return;
		}

		const wallet = selectedWallets.at(0);

		navigate(`/profiles/${activeProfile.id()}/wallets/${wallet?.id()}/votes`);
	};

	const [mobileActiveTab, setMobileActiveTab] = useState<TabId>("transactions");
	const [isLoadingVotes, setIsLoadingVotes] = useState(true);

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const networkAllowsVoting = useMemo(() => selectedWallet?.network().allowsVoting(), [selectedWallet]);

	const selectedWalletsUniqueKeys = useMemo<string>(
		() => selectedWallets.map((wallet) => wallet.id()).join(","),
		[selectedWallets],
	);

	useEffect(() => {
		const syncVotes = async () => {
			try {
				setIsLoadingVotes(true);

				// Sync votes for all selected wallets
				await Promise.all(
					selectedWallets.map(async (wallet) => {
						await activeProfile.validators().sync(wallet.networkId());
						await wallet.synchroniser().votes();
					}),
				);

				// If there's only one wallet selected, show its votes
				if (selectedWallets.length === 1) {
					setVotes(selectedWallets[0].voting().current());
				} else {
					setVotes([]);
				}
			} catch {
				setVotes([]);
			}

			setIsLoadingVotes(false);
		};

		void syncVotes();
	}, [selectedWalletsUniqueKeys, env, activeProfile]);

	useEffect(() => {
		if (!isUpdatingTransactions) {
			setIsUpdatingWallet(false);
		}
	}, [isUpdatingTransactions]);

	return (
		<Page pageTitle={t("COMMON.PORTFOLIO")}>
			<Section className="pb-0 first:pt-0 md:px-0 md:pb-4 xl:mx-auto" innerClassName="m-0 p-0 md:px-0 md:mx-auto">
				{activeProfile.wallets().count() > 0 && (
					<PortfolioHeader
						profile={activeProfile}
						votes={votes}
						hasFocus={hasFocus}
						handleVotesButtonClick={handleVoteButton}
						isLoadingVotes={isLoadingVotes}
						isUpdatingTransactions={isUpdatingTransactions}
						onUpdate={setIsUpdatingWallet}
					/>
				)}
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
					borderClassName="border-transparent dark:border-transaparent md:border-theme-secondary-300 md:dark:border-transparent md:dim:border-transparent"
					backgroundClassName="md:bg-theme-background md:dark:bg-theme-secondary-background md:dim:bg-theme-secondary-background"
					innerClassName="md:-my-2 w-full"
					border
					className={cn("md:hidden", {
						hidden: mobileActiveTab !== "votes",
					})}
				>
					<WalletVote
						isLoadingVotes={isLoadingVotes}
						votes={votes}
						wallet={selectedWallets.at(0)}
						wallets={selectedWallets}
						onButtonClick={handleVoteButton}
					/>
				</Section>
			)}

			<Section className="flex-1 pt-2!">
				<div
					className={cn({
						"hidden md:block": mobileActiveTab !== "transactions",
					})}
				>
					<Transactions
						profile={activeProfile}
						wallets={selectedWallets}
						isLoading={profileIsSyncing}
						isUpdatingWallet={isUpdatingWallet}
						onLoading={setIsUpdatingTransactions}
						selectedWallets={selectedWallets.length}
					/>
				</div>
			</Section>
		</Page>
	);
};
