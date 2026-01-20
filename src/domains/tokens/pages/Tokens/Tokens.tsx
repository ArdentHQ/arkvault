import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Page, Section } from "@/app/components/Layout";
import { useActiveProfile } from "@/app/hooks/env";
import { Transactions } from "@/domains/transaction/components/Transactions";
import { Tab, TabList, Tabs, TabScroll } from "@/app/components/Tabs";
import { TabId } from "@/app/components/Tabs/useTab";
import { TokenHeader } from "@/domains/tokens/components/TokenHeader";
import { PageHeader } from "@/app/components/Header";
import { ThemeIcon } from "@/app/components//Icon";
import { TokensTable } from "@/domains/tokens/components/TokensTable/TokensTable";
import { Panel, usePanels } from "@/app/contexts";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenDetailSidepanel } from "@/domains/tokens/components/TokenDetailsSidepanel/TokensDetailSidepanel";
import { useProfileTokens } from "@/domains/tokens/hooks/use-profile-tokens";
import { ConfirmationModal } from "@/app/components/ConfirmationModal";

export const Tokens = () => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const [activeTab, setActiveTab] = useState<TabId>("tokens");
	const { openPanel } = usePanels();

	const [tokenModalItem, setTokenModelItem] = useState<WalletToken | undefined>(undefined);
	const { reload, isLoading } = useProfileTokens({ profile: activeProfile });

	const [isManageMode, setManageMode] = useState<boolean>(false);
	const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

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
				{activeProfile.wallets().selected().length > 0 && (
					<TokenHeader
						isLoading={isLoading}
						profile={activeProfile}
						onOpenAddressSidepanel={() => {
							if (isManageMode) {
								setShowConfirmModal(true);
							} else {
								openPanel(Panel.Addresses);
							}
						}}
						onReload={reload}
					/>
				)}
			</Section>

			<Tabs className="md:hidden" activeId={activeTab} onChange={setActiveTab} disabled={isManageMode}>
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
				<Tabs activeId={activeTab} onChange={setActiveTab} disabled={isManageMode}>
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
				<TokensTable
					isManageMode={isManageMode}
					setManageMode={setManageMode}
					onClick={(walletToken) => setTokenModelItem(walletToken)}
				/>
			)}

			<ConfirmationModal
				size="2xl"
				description={t("TOKENS.CONFIRMATION_MESSAGE")}
				isOpen={showConfirmModal}
				onConfirm={() => {
					openPanel(Panel.Addresses);
					setShowConfirmModal(false);
					setManageMode(false);
				}}
				onCancel={() => {
					setShowConfirmModal(false);
				}}
			/>

			{tokenModalItem && (
				<TokenDetailSidepanel
					isOpen={!!tokenModalItem}
					walletToken={tokenModalItem}
					onClose={() => setTokenModelItem(undefined)}
				/>
			)}
		</Page>
	);
};
