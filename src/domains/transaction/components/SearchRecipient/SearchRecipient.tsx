import cn from "classnames";
import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { EmptyResults } from "@/app/components/EmptyResults";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { HeaderSearchInput } from "@/app/components/Header/HeaderSearchInput";
import { Modal } from "@/app/components/Modal";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { WalletListItemMobile } from "@/app/components/WalletListItem/WalletListItem.blocks";
import { useBreakpoint } from "@/app/hooks";
import { useSearchWallet } from "@/app/hooks/use-search-wallet";

import {
	RecipientProperties,
	SearchRecipientListItemProperties,
	SearchRecipientListItemResponsiveProperties,
	SearchRecipientProperties,
} from "./SearchRecipient.contracts";

const SearchRecipientListItem: FC<SearchRecipientListItemProperties> = ({
	index,
	recipient,
	onAction,
	selectedAddress,
	isCompact,
}) => {
	const { t } = useTranslation();

	const renderButton = () => {
		if (selectedAddress === recipient.address) {
			return (
				<Button
					data-testid={`RecipientListItem__selected-button-${index}`}
					size={isCompact ? "icon" : undefined}
					variant={isCompact ? "transparent" : "reverse"}
					onClick={() => onAction(recipient.address)}
					className={cn("text-theme-primary-reverse-600", { "-mr-3": isCompact })}
				>
					{t("COMMON.SELECTED")}
				</Button>
			);
		}

		return (
			<Button
				data-testid={`RecipientListItem__select-button-${index}`}
				size={isCompact ? "icon" : undefined}
				variant={isCompact ? "transparent" : "secondary"}
				onClick={() => onAction(recipient.address)}
				className={cn("text-theme-primary-600", { "-mr-3": isCompact })}
			>
				{t("COMMON.SELECT")}
			</Button>
		);
	};

	return (
		<TableRow key={recipient.id} border>
			<TableCell isCompact={isCompact} variant="start" innerClassName="space-x-4">
				<Avatar size={isCompact ? "xs" : "lg"} address={recipient.address} />

				<Address walletName={recipient.alias} address={recipient.address} truncateOnTable />
			</TableCell>

			<TableCell isCompact={isCompact}>
				<span data-testid="RecipientListItem__type" className="whitespace-nowrap">
					{recipient.type === "wallet" ? t("COMMON.MY_WALLET") : t("COMMON.CONTACT")}
				</span>
			</TableCell>

			<TableCell isCompact={isCompact} variant="end" innerClassName="justify-end">
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

	const handleClick = useCallback(() => onAction(recipient.address), [recipient]);

	const isSelected = useMemo(() => selectedAddress === recipient.address, [selectedAddress, recipient]);

	return (
		<tr data-testid={`SearchRecipientListItemResponsive--item-${index}`}>
			<td className="pt-3">
				<WalletListItemMobile
					avatar={
						<Avatar
							shadowClassName="ring-transparent dark:ring-transparent"
							size="lg"
							address={recipient.address}
						/>
					}
					details={
						<Address
							address={recipient.address}
							addressClass="text-xs text-theme-secondary-500 dark:text-theme-secondary-700"
							walletName={recipient.alias}
							walletNameClass="text-sm text-theme-text"
							wrapperClass="space-y-1"
							maxNameChars={0}
							orientation="vertical"
						/>
					}
					extraDetails={
						<span className="mt-0.5 text-sm font-semibold text-theme-secondary-500">
							{recipient.type === "wallet" ? t("COMMON.MY_WALLET") : t("COMMON.CONTACT")}
						</span>
					}
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
	profile,
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
	const isCompact = useMemo<boolean>(
		() => !isLgAndAbove || !profile.appearance().get("useExpandedTables"),
		[isLgAndAbove, profile],
	);
	const useResponsive = useMemo<boolean>(() => isXs || isSm, [isXs, isSm]);

	const columns = useMemo<Column<RecipientProperties>[]>(
		() => [
			{
				Header: t("COMMON.WALLET_ADDRESS"),
				accessor: "alias",
			},
			{
				Header: t("COMMON.TYPE"),
				accessor: "type",
				minimumWidth: true,
			},
			{
				Header: (
					<HeaderSearchBar
						placeholder={t("TRANSACTION.MODAL_SEARCH_RECIPIENT.SEARCH_PLACEHOLDER")}
						offsetClassName="top-1/3 -translate-y-16 -translate-x-6"
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
						noToggleBorder
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
					isCompact={isCompact}
				/>
			);
		},
		[selectedAddress, onAction, isCompact, useResponsive],
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
			<div className="mt-8">
				{useResponsive && (
					<HeaderSearchInput
						placeholder={t("TRANSACTION.MODAL_SEARCH_RECIPIENT.SEARCH_PLACEHOLDER")}
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
					/>
				)}

				<Table columns={columns} data={filteredRecipients as RecipientProperties[]} hideHeader={useResponsive}>
					{renderTableRow}
				</Table>

				{isEmptyResults && (
					<EmptyResults
						className="mt-10"
						title={t("COMMON.EMPTY_RESULTS.TITLE")}
						subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
					/>
				)}
			</div>
		</Modal>
	);
};
