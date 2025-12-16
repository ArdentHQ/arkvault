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
import { TokenHeader } from "@/domains/tokens/components/TokenHeader";
import { Panel, usePanels } from "@/app/contexts/Panels";
import { useDeeplinkActionHandler } from "@/app/hooks/use-deeplink";
import { PageHeader } from "@/app/components/Header";
import { ThemeIcon } from "@/app/components//Icon";
import { TokensTable } from "../../components/WalletHeader/TokensTable/TokensTable";

export const Tokens = ({ hasFocus }: { hasFocus?: boolean }) => {
	const [isUpdatingTransactions, setIsUpdatingTransactions] = useState(false);
	const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);
	const { openPanel } = usePanels();
	useDeeplinkActionHandler({
		onSignMessage: () => {
			openPanel(Panel.SignMessage);
		},
		onTransfer: () => {
			openPanel(Panel.SendTransfer);
		},
	});

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
	const [activeTab, setActiveTab] = useState<TabId>("tokens");
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

			<PageHeader
				title={t("TOKENS.PAGE_TITLE")}
				subtitle={t("TOKENS.PAGE_SUBTITLE")}
				titleIcon={
					<ThemeIcon dimensions={[54, 55]} lightIcon="VotesLight" darkIcon="VotesDark" dimIcon="VotesDim" />
				}
			/>

			<Section className="pt-0 pb-0 first:pt-0 md:px-0 md:pb-4 xl:mx-auto mt-0" innerClassName="m-0 p-0 md:px-0 md:mx-auto">
				{activeProfile.wallets().count() > 0 && (
					<TokenHeader profile={activeProfile} />
				)}
			</Section>

			<Tabs className="md:hidden" activeId={mobileActiveTab} onChange={setMobileActiveTab}>
				<TabScroll>
					<TabList className="h-[48px]">
						<Tab tabId="transactions">
							<span className="whitespace-nowrap">{t("COMMON.TRANSACTIONS")}</span>
						</Tab>
					</TabList>
				</TabScroll>
			</Tabs>

			<Section className="pt-2! pb-3">
				<Tabs className="hidden md:block" activeId={activeTab} onChange={setActiveTab}>
					<TabList className="h-10">
						<Tab tabId="tokens">
							<span className="whitespace-nowrap">{t("COMMON.TOKENS")}</span>
						</Tab>
						<Tab tabId="transactions">
							<span className="whitespace-nowrap">{t("COMMON.TRANSACTIONS")}</span>
						</Tab>
					</TabList>
				</Tabs>
			</Section>

			{activeTab === "transactions" && (
				<Section className="flex-1 pt-2!">
					<div
						className={cn({
							"hidden md:block": mobileActiveTab !== "transactions",
						})}
					>
						<Transactions
							showTabs={false}
							profile={activeProfile}
							wallets={selectedWallets}
							isLoading={profileIsSyncing}
							isUpdatingWallet={isUpdatingWallet}
							onLoading={setIsUpdatingTransactions}
							selectedWallets={selectedWallets.length}
						/>
					</div>
				</Section>
			)}
			{activeTab === "tokens" && (
				<div
					className={cn({
						"hidden md:block": mobileActiveTab !== "transactions",
					})}
				>
					<TokensTable />
				</div>
			)}
		</Page>
	);
};
