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

interface TransactionsProperties {
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

export const Transactions = memo(function Transactions({
	emptyText,
	profile,
	isVisible = true,
	wallets,
	selectedWallets,
}: TransactionsProperties) {
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
				<div className="border-b-theme-secondary-300 dark:border-b-theme-secondary-800 dim:border-b-theme-dim-700 flex w-full flex-col items-start justify-between gap-3 border-b-0 pt-3 pb-4 sm:flex-row md:items-center md:border-b md:px-6 md:py-4">
					{!isLoadingTransfers && (
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base leading-5 font-semibold">
							{t("COMMON.SHOWING_RESULTS", {
								count: transfers.length,
							})}
						</span>
					)}

					{isLoadingTransfers && (
						<div className="flex items-center space-x-1.5">
							<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base leading-5 font-semibold">
								{t("COMMON.SHOWING")}
							</span>
							<Skeleton width={40} height={20} />
							<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base leading-5 font-semibold">
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
							className="text-theme-secondary-text dark:border-theme-secondary-800 dim:text-theme-dim-200 mt-3 mb-1 px-6 text-center leading-5 md:px-6"
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
				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 -mx-6 -mt-1 rounded-b-xl border-t px-6 py-4 md:-mx-px md:mt-0 md:border md:border-t-0">
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
