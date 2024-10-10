import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";
import { FilterTransactions } from "@/domains/transaction/components/FilterTransactions";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";
import { TransactionTable } from "@/domains/transaction/components/TransactionTable";
import { useProfileTransactions } from "@/domains/transaction/hooks/use-profile-transactions";
import { Dropdown } from "@/app/components/Dropdown";
import { TabId } from "@/app/components/Tabs/useTab";
import { Icon } from "@/app/components/Icon";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import cn from "classnames";

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
		fetchMore,
		hasEmptyResults,
		hasMore,
	} = useProfileTransactions({ limit: 30, profile, wallets });

	useEffect(() => {
		if (isLoading) {
			return;
		}

		updateFilters({
			activeMode: "all",
			activeTransactionType: undefined,
		});
	}, [isLoading, wallets.length, updateFilters]);

	useEffect(() => {
		onLoading?.(isLoadingTransactions);
	}, [isLoadingTransactions, onLoading]);

	useEffect(() => {
		if (isUpdatingWallet) {
			updateFilters({ activeMode, activeTransactionType, timestamp: Date.now() });
		}
	}, [isUpdatingWallet]); // eslint-disable-line react-hooks/exhaustive-deps

	const filterOptions = [
		{
			active: activeMode === "all",
			label: t("TRANSACTION.ALL_HISTORY"),
			value: "all",
		},
		{
			active: activeMode === "received",
			label: t("TRANSACTION.INCOMING"),
			value: "received",
		},
		{
			active: activeMode === "sent",
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
			});
		},
		[isLoading, activeMode, activeTransactionType],
	);

	const filterChangeHandler = useCallback(
		(option, type) => {
			setActiveTransactionTypeLabel(option.label);

			updateFilters({
				activeMode,
				activeTransactionType: type,
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
									{option.label}
								</Tab>
							))}
						</TabList>
					</Tabs>

					<div className="my-3 flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 md:hidden">
						<div className="flex-1">
							<Dropdown
								data-testid="Transactions--filter-dropdown"
								disableToggle={wallets.length === 0 || isLoadingTransactions}
								dropdownClass="mx-4 sm:w-full sm:mx-0"
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
								isDisabled={wallets.length === 0 || isLoadingTransactions}
							/>
						</div>
					</div>
				</>
			)}

			{hasEmptyResults ? (
				<>
					{activeTransactionType ? (
						<EmptyBlock className="sm:text-left">
							<Trans
								i18nKey="DASHBOARD.LATEST_TRANSACTIONS.NO_RESULTS"
								values={{
									type: activeTransactionTypeLabel,
								}}
								components={{ bold: <strong /> }}
							/>
						</EmptyBlock>
					) : (
						<EmptyBlock className="sm:text-left">
							{emptyText || t("DASHBOARD.LATEST_TRANSACTIONS.EMPTY_MESSAGE")}
						</EmptyBlock>
					)}
				</>
			) : (
				<TableWrapper className={cn("border-none", { "!rounded-b-none": hasMore })}>
					<div className="flex w-full flex-col items-start justify-between gap-3 border-b-0 border-b-theme-secondary-300 pb-4 pt-3 dark:border-b-theme-secondary-800 sm:flex-row md:items-center md:border-b md:px-6 md:py-4">
						<span className="text-base font-semibold leading-5 text-theme-secondary-700 dark:text-theme-secondary-500">
							{t("COMMON.SHOWING_RESULTS", { count: transactions.length })}
						</span>
						<FilterTransactions
							className="w-full sm:w-fit md:my-auto"
							wallets={wallets}
							onSelect={filterChangeHandler}
							isDisabled={wallets.length === 0 || isLoadingTransactions}
						/>
					</div>
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

					{transactionModalItem && (
						<TransactionDetailModal
							isOpen={!!transactionModalItem}
							transactionItem={transactionModalItem}
							profile={profile}
							onClose={() => setTransactionModalItem(undefined)}
						/>
					)}
				</TableWrapper>
			)}

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
