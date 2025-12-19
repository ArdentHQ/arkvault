import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Page, Section } from "@/app/components/Layout";
import { useActiveProfile } from "@/app/hooks/env";
import { Transactions } from "@/domains/transaction/components/Transactions";
import { Tab, TabList, Tabs, TabScroll } from "@/app/components/Tabs";
import { TabId } from "@/app/components/Tabs/useTab";
import { TokenHeader } from "@/domains/tokens/components/TokenHeader";
import { PageHeader } from "@/app/components/Header";
import { ThemeIcon } from "@/app/components//Icon";
import { Button } from "@/app/components/Button";
import { TokensTable } from "@/domains/tokens/components/TokensTable/TokensTable";
import { Panel, usePanels } from "@/app/contexts";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenDetailSidepanel } from "../../components/TokenDetailsSidepanel/TokensDetailSidepanel";
import { useProfileTransactions } from "@/domains/transaction/hooks/use-profile-transactions";

export const Tokens = () => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const [activeTab, setActiveTab] = useState<TabId>("tokens");
	const { openPanel } = usePanels();

	const [tokenModalItem, setTokenModelItem] = useState<WalletToken | undefined>(undefined)
	const tokens = activeProfile.tokens().selected()
	console.log({ tokens: tokens.values() })

	const {
		transactions,
	} = useProfileTransactions({ limit: 30, profile: activeProfile, wallets: activeProfile.wallets().values() });

	return (
		<Page pageTitle={t("COMMON.PORTFOLIO")}>
			<PageHeader
				title={t("TOKENS.PAGE_TITLE")}
				subtitle={t("TOKENS.PAGE_SUBTITLE")}
				titleIcon={
					<ThemeIcon
						dimensions={[54, 55]}
						lightIcon="TokensLight"
						darkIcon="TokensDark"
						dimIcon="TokensDim"
					/>
				}
			/>

			<Section
				className="mt-0 pt-0 pb-0 first:pt-0 md:px-0 md:pb-4 xl:mx-auto"
				innerClassName="m-0 p-0 md:px-0 md:mx-auto"
			>
				<TokenHeader
					profile={activeProfile}
					onOpenAddressSidepanel={() => {
						openPanel(Panel.Addresses);
					}}
				/>
			</Section>

			<Tabs className="md:hidden" activeId={activeTab} onChange={setActiveTab}>
				<TabScroll>
					<TabList className="pb-2">
						<Tab tabId="tokens">
							<span className="whitespace-nowrap">{t("COMMON.TOKENS")}</span>
						</Tab>
						<Tab tabId="transactions">
							<span className="whitespace-nowrap">{t("COMMON.TRANSACTIONS")}</span>
						</Tab>
					</TabList>
				</TabScroll>
			</Tabs>

			<Section className="hidden pt-2! pb-3 md:block">
				<Tabs activeId={activeTab} onChange={setActiveTab}>
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
				<Section className="flex-1 pt-0!">
					<Transactions showTabs={false} profile={activeProfile} wallets={[]} isLoading={false} />
				</Section>
			)}

			{activeTab === "tokens" && (
				<div>
					<Section className="my-0 md:py-0!">
						<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded border sm:hidden">
							<Button
								className="text-theme-primary-600 dark:text-theme-primary-400 dark:hover:text-theme-primary-300 hover:text-theme-primary-700 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-50 h-12 w-full"
								data-testid="tokens__add-contact-btn-mobile"
								variant="primary-transparent"
								size="sm"
								icon="Plus"
							>
								<p className="dim:text-theme-dim-50 text-base leading-5 font-semibold">
									{t("COMMON.ADD_TOKEN")}
								</p>
							</Button>
						</div>
					</Section>

					<TokensTable onClick={(walletToken) => setTokenModelItem(walletToken)} />
				</div>
			)}

			{tokenModalItem && (
				<TokenDetailSidepanel
					isOpen={!!transactions.at(0)}
					walletToken={tokens.first()}
				/>
			)}
		</Page>
	);
};
