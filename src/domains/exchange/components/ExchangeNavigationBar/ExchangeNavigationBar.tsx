import React from "react";
import { useTranslation } from "react-i18next";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";
import { useBreakpoint } from "@/app/hooks";

enum ExchangeView {
	Exchanges = "EXCHANGES",
	Transactions = "TRANSACTIONS",
}

interface ExchangeNavigationBarProperties {
	currentView: ExchangeView;
	onChange: (view: any) => void;
}

export const ExchangeNavigationBar = ({ currentView, onChange }: ExchangeNavigationBarProperties) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

	return (
		<div className="-mx-6 -mt-2 mb-4 border-t border-theme-secondary-300 bg-theme-secondary-200 px-6 py-2 dark:border-theme-dark-700 dark:bg-black md:mx-0 md:mb-3 md:mt-0 md:border-t-0 md:bg-transparent md:p-0 md:px-0 md:py-0 dark:md:bg-transparent">
			<Tabs activeId={currentView} className="w-full" onChange={onChange}>
				<TabList noBackground={!isMdAndAbove}>
					<Tab tabId={ExchangeView.Exchanges}>{t("EXCHANGE.NAVIGATION.EXCHANGES")}</Tab>

					<Tab tabId={ExchangeView.Transactions}>{t("EXCHANGE.NAVIGATION.TRANSACTIONS")}</Tab>
				</TabList>
			</Tabs>
		</div>
	);
};
