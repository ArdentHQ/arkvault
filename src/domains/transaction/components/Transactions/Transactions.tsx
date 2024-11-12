import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { FilterTransactions } from "@/domains/transaction/components/FilterTransactions";
import { Icon } from "@/app/components/Icon";
import { TabId } from "@/app/components/Tabs/useTab";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";
import { TransactionTable } from "@/domains/transaction/components/TransactionTable";
import cn from "classnames";
import { useProfileTransactions } from "@/domains/transaction/hooks/use-profile-transactions";
import { useWalletTransactionCounts } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-transaction-counts";

interface TransactionsProperties {
	emptyText?: string;
	profile: Contracts.IProfile;
	isVisible?: boolean;
	wallets: Contracts.IReadWriteWallet[];
	isLoading?: boolean;
	title?: React.ReactNode;
	onLoading?: (status: boolean) => void;
	isUpdatingWallet?: boolean;
}

export const Transactions = memo(function Transactions({
	emptyText,
	profile,
	isVisible = true,
	wallets,
	isLoading = false,
	title,
	isUpdatingWallet,
	onLoading,
}: TransactionsProperties) {
	const { t } = useTranslation();

	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData | undefined>(
		undefined,
	);

	const [activeTransactionTypeLabel, setActiveTransactionTypeLabel] = useState("");

	const {
		updateFilters,
		isLoadingTransactions,
		isLoadingMore,
		transactions,
		activeMode,
		activeTransactionType,
		selectedTransactionTypes,
		fetchMore,
		hasEmptyResults,
		hasMore,
	} = useProfileTransactions({ limit: 30, profile, wallets });

	const showMore = !!selectedTransactionTypes?.length && hasMore;

	useEffect(() => {
		if (isLoading) {
			return;
		}

		updateFilters({
			activeMode: "all",
			activeTransactionType: undefined,
			selectedTransactionTypes,
		});
	}, [isLoading, wallets.length, updateFilters]);

	useEffect(() => {
		onLoading?.(isLoadingTransactions);
	}, [isLoadingTransactions, onLoading]);

	useEffect(() => {
		if (isUpdatingWallet) {
			updateFilters({ activeMode, activeTransactionType, selectedTransactionTypes, timestamp: Date.now() });
		}
	}, [isUpdatingWallet]); // eslint-disable-line react-hooks/exhaustive-deps

	const { sent, received } = useWalletTransactionCounts(wallets[0]);

	const filterOptions = [
		{
			active: activeMode === "all",
			count: undefined,
			label: t("TRANSACTION.ALL_HISTORY"),
			value: "all",
		},
		{
			active: activeMode === "received",
			count: received,
			label: t("TRANSACTION.INCOMING"),
			value: "received",
		},
		{
			active: activeMode === "sent",
			count: sent,
			label: t("TRANSACTION.OUTGOING"),
			value: "sent",
		},
	];

	const selectedFilterLabel = useMemo(
		() => filterOptions.find((option) => option.value === activeMode)?.label,
		[activeMode],
	);

	const activeModeChangeHandler = useCallback(
		(activeTab: TabId) => {
			if (isLoading || activeTab === activeMode) {
				return;
			}

			updateFilters({
				activeMode: activeTab as string,
				activeTransactionType,
				selectedTransactionTypes,
			});
		},
		[isLoading, activeMode, activeTransactionType],
	);

	const filterChangeHandler = useCallback(
		(option, type, selectedTransactionTypes) => {
			setActiveTransactionTypeLabel(option.label);

			updateFilters({
				activeMode,
				activeTransactionType: type,
				selectedTransactionTypes,
			});
		},
		[activeMode],
	);

	const showTabs = useMemo(() => {
		if (isLoadingTransactions) {
			return true;
		}

		const hasFilter = (activeMode !== undefined && activeMode !== "all") || activeTransactionType !== undefined;

		return !hasEmptyResults || hasFilter || hasMore;
	}, [activeMode, hasEmptyResults, activeTransactionType, isLoadingTransactions, hasMore]);

	if (!isVisible) {
		return <></>;
	}

	return (
		<>
			{title && (
				<div className="relative hidden justify-between md:flex">
					<h2 className="mb-3 text-2xl font-bold">{title}</h2>
				</div>
			)}

			{showTabs && (
				<>
					<Tabs className="mb-3 hidden md:block" activeId={activeMode} onChange={activeModeChangeHandler}>
						<TabList className="h-14 px-6 py-4">
							{filterOptions.map((option) => (
								<Tab tabId={option.value} key={option.value} className="pb-9 before:!top-1/3">
									<span className="flex items-center space-x-2">
										<span>{option.label}</span>
										{!!option.count && (
											<span className="rounded bg-theme-navy-100 px-1.5 py-0.5 text-xs leading-[17px] text-theme-secondary-700 dark:border-theme-secondary-800 dark:bg-theme-secondary-900 dark:text-theme-secondary-500">
												{option.count}
											</span>
										)}
									</span>
								</Tab>
							))}
						</TabList>
					</Tabs>

					<div className="my-3 flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 md:hidden">
						<div className="flex-1">
							<Dropdown
								data-testid="Transactions--filter-dropdown"
								disableToggle={wallets.length === 0 || isLoadingTransactions}
								options={filterOptions}
								onSelect={({ value }) => activeModeChangeHandler(value)}
								toggleContent={(isOpen) => (
									<div className="flex h-11 w-full cursor-pointer items-center justify-between space-x-4 overflow-hidden rounded-xl border border-theme-primary-100 p-3 dark:border-theme-secondary-800 sm:px-4 sm:py-3">
										<span className="text-base font-semibold leading-tight">
											{selectedFilterLabel}
										</span>
										<Icon size="xs" name={isOpen ? "ChevronUpSmall" : "ChevronDownSmall"} />
									</div>
								)}
							/>
						</div>

						<div className="hidden flex-1">
							<FilterTransactions
								data-testid="FilterTransactions--Mobile"
								wallets={wallets}
								onSelect={filterChangeHandler}
								selectedTransactionTypes={selectedTransactionTypes}
							/>
						</div>
					</div>
				</>
			)}

			<TableWrapper className={cn({ "!rounded-b-none border-none": showMore })}>
				<div className="flex w-full flex-col items-start justify-between gap-3 border-b-0 border-b-theme-secondary-300 pb-4 pt-3 dark:border-b-theme-secondary-800 sm:flex-row md:items-center md:border-b md:px-6 md:py-4">
					<span className="text-base font-semibold leading-5 text-theme-secondary-700 dark:text-theme-secondary-500">
						{t("COMMON.SHOWING_RESULTS", {
							count: selectedTransactionTypes?.length ? transactions.length : 0,
						})}
					</span>
					<FilterTransactions
						className="w-full sm:w-fit md:my-auto"
						wallets={wallets}
						onSelect={filterChangeHandler}
						selectedTransactionTypes={selectedTransactionTypes}
					/>
				</div>

				{hasEmptyResults && (
					<>
						{selectedTransactionTypes?.length ? (
							<EmptyBlock className="border-none sm:text-left">
								<Trans
									i18nKey="DASHBOARD.LATEST_TRANSACTIONS.NO_RESULTS"
									values={{
										type: activeTransactionTypeLabel,
									}}
									components={{ bold: <strong /> }}
								/>
							</EmptyBlock>
						) : (
							<EmptyBlock className="border-none sm:text-left">
								{emptyText || t("TRANSACTION.NO_FILTERS_SELECTED")}
							</EmptyBlock>
						)}
					</>
				)}

				{!hasEmptyResults && (
					<TransactionTable
						transactions={transactions}
						exchangeCurrency={profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency)}
						hideHeader={hasEmptyResults}
						isLoading={isLoadingTransactions}
						skeletonRowsLimit={8}
						onRowClick={setTransactionModalItem}
						profile={profile}
						coinName={wallets.at(0)?.currency()}
					/>
				)}

				{transactionModalItem && (
					<TransactionDetailModal
						isOpen={!!transactionModalItem}
						transactionItem={transactionModalItem}
						profile={profile}
						onClose={() => setTransactionModalItem(undefined)}
					/>
				)}
			</TableWrapper>

			{showMore && (
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
