import React from "react";
import { useTranslation } from "react-i18next";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";

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

	return (
		<Tabs activeId={currentView} className="mb-3 w-full" onChange={onChange}>
			<TabList>
				<Tab tabId={ExchangeView.Exchanges}>{t("EXCHANGE.NAVIGATION.EXCHANGES")}</Tab>

				<Tab tabId={ExchangeView.Transactions}>{t("EXCHANGE.NAVIGATION.TRANSACTIONS")}</Tab>
			</TabList>
		</Tabs>
	);
};
