import React from "react";
import { useTranslation } from "react-i18next";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";

enum ExchangeView {
	Exchanges = "EXCHANGES",
	Transactions = "TRANSACTIONS",
}

interface ExchangeNavigationBarProperties {
	currentView: ExchangeView;
	exchangeTransactionsCount: number;
	onChange: (view: any) => void;
}

export const ExchangeNavigationBar = ({
	currentView,
	exchangeTransactionsCount,
	onChange,
}: ExchangeNavigationBarProperties) => {
	const { t } = useTranslation();

	return (
		<nav className="sticky mb-4 -mt-0 md:mt-4 dark:bg-black top-21 bg-theme-secondary-100 z-10">
			<div className="mx-auto flex items-center justify-between px-6 lg:container md:px-10">
				<Tabs activeId={currentView} className="w-full" onChange={onChange}>
					<TabList className="flex h-[3.25rem] w-full flex-row gap-6" noBackground>
						<Tab tabId={ExchangeView.Exchanges} className="m-0 mr-6">
							{t("EXCHANGE.NAVIGATION.EXCHANGES")}
						</Tab>

						<Tab tabId={ExchangeView.Transactions} count={exchangeTransactionsCount} className="m-0">
							{t("EXCHANGE.NAVIGATION.TRANSACTIONS")}
						</Tab>
					</TabList>
				</Tabs>
			</div>
		</nav>
	);
};
