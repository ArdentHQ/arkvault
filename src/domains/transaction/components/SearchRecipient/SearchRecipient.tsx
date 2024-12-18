import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import {
	RecipientProperties,
	SearchRecipientListItemProperties,
	SearchRecipientListItemResponsiveProperties,
	SearchRecipientProperties,
} from "./SearchRecipient.contracts";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { EmptyResults } from "@/app/components/EmptyResults";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { Modal } from "@/app/components/Modal";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { useSearchWallet } from "@/app/hooks/use-search-wallet";
import { useBreakpoint } from "@/app/hooks";
import { HeaderSearchInput } from "@/app/components/Header/HeaderSearchInput";
import { RecipientItemMobile } from "@/app/components/WalletListItem/WalletListItem.blocks";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { TableWrapper } from "@/app/components/Table/TableWrapper";

const SearchRecipientListItem: FC<SearchRecipientListItemProperties> = ({
	index,
	recipient,
	onAction,
	selectedAddress,
}) => {
	const { t } = useTranslation();
	const isSelected = useMemo(() => selectedAddress === recipient.address, [selectedAddress, recipient]);

	const renderButton = () => {
		if (isSelected) {
			return (
				<Button
					data-testid={`RecipientListItem__selected-button-${index}`}
					size="icon"
					variant="transparent"
					onClick={() => onAction(recipient.address)}
					className="-mr-3 py-0 text-sm font-semibold leading-[17px] text-theme-primary-reverse-600"
				>
					{t("COMMON.SELECTED")}
				</Button>
			);
		}

		return (
			<Button
				data-testid={`RecipientListItem__select-button-${index}`}
				size="icon"
				variant="transparent"
				onClick={() => onAction(recipient.address)}
				className="-mr-3 text-sm font-semibold leading-[17px] text-theme-primary-600"
			>
				{t("COMMON.SELECT")}
			</Button>
		);
	};

	return (
		<TableRow key={recipient.id} border className="relative">
			<TableCell variant="start" innerClassName="space-x-4 my-0.5" isSelected={isSelected}>
				<Address
					walletName={recipient.alias}
					address={recipient.address}
					truncateOnTable
					walletNameClass="text-sm text-theme-secondary-900 dark:text-theme-secondary-200 leading-[17px]"
					addressClass="text-sm text-theme-secondary-700 dark:text-theme-secondary-500 leading-[17px] flex items-center h-5"
				/>
			</TableCell>

			<TableCell isSelected={isSelected} innerClassName="my-0.5">
				<span
					data-testid="RecipientListItem__type"
					className="whitespace-nowrap text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500"
				>
					{recipient.type === "wallet" ? t("COMMON.MY_WALLET") : t("COMMON.CONTACT")}
				</span>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end my-0.5" isSelected={isSelected}>
				{renderButton()}
			</TableCell>
		</TableRow>
	);
};

const SearchRecipientListItemResponsive: FC<SearchRecipientListItemResponsiveProperties> = ({
	index,
	recipient,
	onAction,
	selectedAddress,
}) => {
	const { t } = useTranslation();
	const { isSmAndAbove } = useBreakpoint();
	const handleClick = useCallback(() => onAction(recipient.address), [recipient]);

	const isSelected = useMemo(() => selectedAddress === recipient.address, [selectedAddress, recipient]);

	return (
		<tr data-testid={`SearchRecipientListItemResponsive--item-${index}`}>
			<td className="pt-3">
				<RecipientItemMobile
					address={
						<TruncateMiddleDynamic
							data-testid="Address__address_condensed"
							value={recipient.address}
							availableWidth={isSmAndAbove ? undefined : 100}
							className="text-xs font-semibold text-theme-secondary-700 dark:text-theme-secondary-500"
						/>
					}
					type={recipient.type === "wallet" ? t("COMMON.MY_WALLET") : t("COMMON.CONTACT")}
					name={recipient.alias || ""}
					selected={isSelected}
					onClick={handleClick}
				/>
			</td>
		</tr>
	);
};

export const SearchRecipient: FC<SearchRecipientProperties> = ({
	title,
	description,
	isOpen,
	onClose,
	onAction,
	recipients,
	selectedAddress,
}) => {
	const {
		setSearchKeyword,
		filteredList: filteredRecipients,
		isEmptyResults,
	} = useSearchWallet({
		wallets: recipients,
	});

	const { t } = useTranslation();

	const { isXs, isSm, isLgAndAbove } = useBreakpoint();

	const useResponsive = useMemo<boolean>(() => isXs || isSm, [isXs, isSm]);

	const columns = useMemo<Column<RecipientProperties>[]>(
		() => [
			{
				Header: t("COMMON.ADDRESS"),
				accessor: "alias",
			},
			{
				Header: t("COMMON.TYPE"),
				accessor: "type",
				headerClassName: "no-border",
				minimumWidth: true,
			},
			{
				Header: (
					<HeaderSearchBar
						placeholder={t("TRANSACTION.MODAL_SEARCH_RECIPIENT.SEARCH_PLACEHOLDER")}
						offsetClassName="top-1/3 -translate-y-8 -translate-x-8"
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
						noToggleBorder
						alwaysDisplayClearButton
					/>
				),
				accessor: "id",
				className: "justify-end",
				disableSortBy: true,
				headerClassName: "no-border",
				minimumWidth: true,
			},
		],
		[t, setSearchKeyword],
	);

	const renderTableRow = useCallback(
		(recipient: RecipientProperties, index: number) => {
			if (useResponsive) {
				return (
					<SearchRecipientListItemResponsive
						index={index}
						selectedAddress={selectedAddress}
						recipient={recipient}
						onAction={onAction}
					/>
				);
			}

			return (
				<SearchRecipientListItem
					index={index}
					selectedAddress={selectedAddress}
					recipient={recipient}
					onAction={onAction}
				/>
			);
		},
		[selectedAddress, onAction, useResponsive],
	);

	return (
		<Modal
			isOpen={isOpen}
			title={title || t("TRANSACTION.MODAL_SEARCH_RECIPIENT.TITLE")}
			description={description || t("TRANSACTION.MODAL_SEARCH_RECIPIENT.DESCRIPTION")}
			size={isLgAndAbove ? "4xl" : "2xl"}
			onClose={onClose}
			noButtons
		>
			<div className="mt-4">
				{useResponsive && (
					<HeaderSearchInput
						placeholder={t("TRANSACTION.MODAL_SEARCH_RECIPIENT.SEARCH_PLACEHOLDER")}
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
					/>
				)}

				<TableWrapper>
					<Table
						columns={columns}
						data={filteredRecipients as RecipientProperties[]}
						hideHeader={useResponsive}
					>
						{renderTableRow}
					</Table>

					{isEmptyResults && (
						<EmptyResults
							className="mt-10 rounded-xl"
							title={t("COMMON.EMPTY_RESULTS.TITLE")}
							subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
						/>
					)}
				</TableWrapper>
			</div>
		</Modal>
	);
};
