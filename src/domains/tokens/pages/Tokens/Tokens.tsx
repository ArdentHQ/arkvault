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

export const Tokens = () => {
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();
	const [activeTab, setActiveTab] = useState<TabId>("tokens");

	return (
		<Page pageTitle={t("COMMON.PORTFOLIO")}>
			<PageHeader
				title={t("TOKENS.PAGE_TITLE")}
				subtitle={t("TOKENS.PAGE_SUBTITLE")}
				titleIcon={
					<ThemeIcon dimensions={[54, 55]} lightIcon="TokensLight" darkIcon="TokensDark" dimIcon="TokensDim" />
				}
			/>

			<Section className="pt-0 pb-0 first:pt-0 md:px-0 md:pb-4 xl:mx-auto mt-0" innerClassName="m-0 p-0 md:px-0 md:mx-auto">
				{activeProfile.wallets().count() > 0 && (
					<TokenHeader profile={activeProfile} />
				)}
			</Section>

			<Tabs className="md:hidden" activeId={activeTab} onChange={setActiveTab}>
				<TabScroll>
					<TabList className="h-10">
						<Tab tabId="tokens">
							<span className="whitespace-nowrap">{t("COMMON.TOKENS")}</span>
						</Tab>
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
					<div>
						<Transactions
							showTabs={false}
							profile={activeProfile}
							wallets={[]}
							isLoading={false}
							onLoading={console.log}
						/>
					</div>
				</Section>
			)}
			{activeTab === "tokens" && (
				<div>
					<Section className="my-0 py-0">
						<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded border sm:hidden">
							<Button
								className="text-theme-primary-600 dark:text-theme-primary-400 dark:hover:text-theme-primary-300 hover:text-theme-primary-700 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-50 h-12 w-full"
								data-testid="contacts__add-contact-btn-mobile"
								onClick={() => console.log("TODO: ADD Token")}
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

					<TokensTable />
				</div>
			)}
		</Page>
	);
};
