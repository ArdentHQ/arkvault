import React from "react";
import { useTranslation } from "react-i18next";
import { styled } from "twin.macro";

import { defaultStyle } from "./styles";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";

enum ExchangeView {
	Exchanges = "EXCHANGES",
	Transactions = "TRANSACTIONS",
}

const NavWrapper = styled.nav`
	${defaultStyle}
`;

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
		<NavWrapper>
			<div className="mx-auto flex items-center justify-between px-6 md:px-10 lg:container">
				<Tabs activeId={currentView} className="w-full" onChange={onChange}>
					<TabList className="h-[3.25rem] w-full flex flex-row gap-6" noBackground>
						<Tab tabId={ExchangeView.Exchanges} className="m-0 mr-6">{t("EXCHANGE.NAVIGATION.EXCHANGES")}</Tab>

						<Tab tabId={ExchangeView.Transactions} count={exchangeTransactionsCount} className="m-0">
							{t("EXCHANGE.NAVIGATION.TRANSACTIONS")}
						</Tab>
					</TabList>
				</Tabs>
			</div>
		</NavWrapper>
	);
};
