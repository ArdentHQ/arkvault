import { Contracts } from "@/app/lib/profiles";
import React, { memo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { TransactionDetailSidePanel } from "@/domains/transaction/components/TransactionDetailSidePanel";
import { ExtendedTransactionDTO, TransactionTable } from "@/domains/transaction/components/TransactionTable";
import cn from "classnames";
import { Skeleton } from "@/app/components/Skeleton";
import { Panel, usePanels } from "@/app/contexts";
import { useTokenTransfers } from "@/domains/tokens/pages/hooks/use-token-transfers";

interface TokenTransfersProperties {
	emptyText?: string;
	profile: Contracts.IProfile;
	isVisible?: boolean;
	wallets: Contracts.IReadWriteWallet[];
	isLoading?: boolean;
	onLoading?: (status: boolean) => void;
	isUpdatingWallet?: boolean;
	selectedWallets?: number;
	showTabs?: boolean;
}

export const TokenTransfers = memo(function TokenTransfers({
	emptyText,
	profile,
	isVisible = true,
	wallets,
	selectedWallets,
}: TokenTransfersProperties) {
	const { t } = useTranslation();

	const { setIsMinimized, currentOpenedPanel, closePanel, openPanel } = usePanels();

	const [transactionModalItem, setTransactionModalItem] = useState<ExtendedTransactionDTO | undefined>(undefined);

	const { isLoadingMore, transfers, hasMore, isLoadingTransfers, hasEmptyResults, fetchMore } = useTokenTransfers({
		profile,
		wallets,
	});

	if (!isVisible) {
		return <></>;
	}

	return (
		<>
			<TableWrapper className={cn({ "rounded-b-none! border-none": hasMore })}>
				<div className="flex w-full flex-col items-start justify-between gap-3 border-b-0 border-b-theme-secondary-300 pb-4 pt-3 dim:border-b-theme-dim-700 dark:border-b-theme-secondary-800 sm:flex-row md:items-center md:border-b md:px-6 md:py-4">
					{!isLoadingTransfers && (
						<span className="text-base font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
							{t("COMMON.SHOWING_RESULTS", {
								count: transfers.length,
							})}
						</span>
					)}

					{isLoadingTransfers && (
						<div className="flex items-center space-x-1.5">
							<span className="text-base font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
								{t("COMMON.SHOWING")}
							</span>
							<Skeleton width={40} height={20} />
							<span className="text-base font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
								{t("COMMON.RESULTS").toLowerCase()}
							</span>
						</div>
					)}
				</div>

				<TransactionTable
					transactions={transfers}
					exchangeCurrency={profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency)}
					isLoading={isLoadingTransfers}
					skeletonRowsLimit={8}
					onRowClick={(transaction) => {
						if (currentOpenedPanel?.name === Panel.TransactionDetails) {
							setIsMinimized(false);
						} else {
							openPanel(Panel.TransactionDetails);
						}

						setTransactionModalItem(transaction);
					}}
					profile={profile}
					hideSender={selectedWallets === 1}
					sortBy={{
						column: "date",
						desc: true,
					}}
					onSortChange={() => {}}
				/>

				{hasEmptyResults && (
					<>
						<div
							data-testid="Transactions__no-filters-selected"
							className="mb-1 mt-3 px-6 text-center leading-5 text-theme-secondary-text dim:text-theme-dim-200 dark:border-theme-secondary-800 md:px-6"
						>
							{emptyText || t("TRANSACTION.NO_FILTERS_SELECTED")}
						</div>
					</>
				)}

				{transactionModalItem && currentOpenedPanel?.name === Panel.TransactionDetails && (
					<TransactionDetailSidePanel
						isOpen={!!transactionModalItem}
						transactionItem={transactionModalItem}
						profile={profile}
						wallets={wallets}
						onClose={() => {
							/* istanbul ignore next -- @preserve */
							closePanel().then(() => {
								setTransactionModalItem(undefined);
							});
						}}
					/>
				)}
			</TableWrapper>

			{hasMore && (
				<div className="-mx-6 -mt-1 rounded-b-xl border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-secondary-800 md:-mx-px md:mt-0 md:border md:border-t-0">
					<Button
						data-testid="transactions__fetch-more-button"
						variant="secondary"
						className="w-full py-1.5 leading-5"
						disabled={isLoadingMore}
						onClick={() => fetchMore()}
					>
						{isLoadingMore ? t("COMMON.LOADING") : t("COMMON.LOAD_MORE")}
					</Button>
				</div>
			)}
		</>
	);
});
