import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets";
import { PortfolioBreakdown } from "@/domains/dashboard/components/PortfolioBreakdown";
import { PortfolioHeader } from "@/domains/wallet/components/PortfolioHeader";
import { WalletsGroupsList } from "@/domains/wallet/components/WalletsGroup";
import { useLatestTransactions } from "@/domains/dashboard/hooks/use-latest-transactions";
import { TransactionTable } from "@/domains/transaction/components/TransactionTable";
import { TableWrapper } from "@/app/components/Table/TableWrapper";

import { Page, Section } from "@/app/components/Layout";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { WelcomeModal } from "@/domains/profile/components/WelcomeModal";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";

export const Dashboard: React.VFC = () => {
	const activeProfile = useActiveProfile();
	const wallet = activeProfile.wallets().first();
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();
	const { profileIsSyncing, profileIsSyncingExchangeRates } = useConfiguration();
	const profileIsSyncedWithNetwork = !activeProfile.hasBeenPartiallyRestored();
	const walletsCount = activeProfile.wallets().count();
	const { selectedNetworkIds } = useWalletFilters({ profile: activeProfile });
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData | undefined>(
		undefined,
	);
	const showTransactions = activeProfile.appearance().get("dashboardTransactionHistory");
	const exchangeCurrency = activeProfile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
	const { isLoadingTransactions, latestTransactions } = useLatestTransactions({
		profile: activeProfile,
		profileIsSyncing,
	});

	const liveNetworkIds = useMemo(
		() =>
			uniq(
				activeProfile
					.wallets()
					.values()
					.filter((wallet) => wallet.network().isLive())
					.map((wallet) => wallet.networkId()),
			),
		[activeProfile, walletsCount, profileIsSyncedWithNetwork], // eslint-disable-line react-hooks/exhaustive-deps
	);

	return (
		<>
			<Page pageTitle={t("DASHBOARD.DASHBOARD_PAGE.TITLE")} isBackDisabled={true}>
				<Section>
					<PortfolioHeader />
					<PortfolioBreakdown
						profile={activeProfile}
						profileIsSyncingExchangeRates={profileIsSyncingExchangeRates}
						liveNetworkIds={liveNetworkIds}
						selectedNetworkIds={selectedNetworkIds}
					/>
				</Section>

				<div className="lg:container md:px-10 lg:mx-auto">
					<WalletsGroupsList />
				</div>

				{showTransactions && (
					<Section className="mt-4 md:mt-0" data-testid="dashboard__transactions-view">
						<h2 className="mb-6 text-2xl font-bold">{t("DASHBOARD.LATEST_TRANSACTIONS.TITLE")}</h2>

						<TableWrapper className="overflow-hidden">
							<>

								<TransactionTable
									transactions={latestTransactions}
									exchangeCurrency={exchangeCurrency}
									hideHeader={!isLoadingTransactions && latestTransactions.length === 0}
									isLoading={isLoadingTransactions && latestTransactions.length === 0}
									skeletonRowsLimit={8}
									onRowClick={setTransactionModalItem}
									profile={activeProfile}
									coinName={wallet.currency()}
								/>

								{latestTransactions.length === 0 && !isLoadingTransactions && (
									<EmptyBlock>{t("DASHBOARD.LATEST_TRANSACTIONS.EMPTY_MESSAGE")}</EmptyBlock>
								)}
							</>

						</TableWrapper>
					</Section>
				)}
			</Page>

			<WelcomeModal profile={activeProfile} environment={env} />

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
