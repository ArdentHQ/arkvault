import cn from "classnames";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { TableCell } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { WalletIcons, WalletIconsSkeleton } from "@/app/components/WalletIcons";
import {
	BalanceProperties,
	ButtonsCellProperties,
	CurrencyProperties,
	WalletCellProperties,
	StarredProperties,
	InfoProperties,
	RecipientItemMobileProperties,
	ReceiverItemMobileProperties,
} from "@/app/components/WalletListItem/WalletListItem.contracts";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useBreakpoint, useWalletAlias } from "@/app/hooks";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Skeleton } from "@/app/components/Skeleton";
import { useWalletTransactions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-transactions";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { TruncateEnd } from "@/app/components/TruncateEnd";

const excludedIcons = ["isStarred"];

export const Balance: React.VFC<BalanceProperties> = ({ wallet, isSynced, isLargeScreen = true, className }) => {
	const renderAmount = () => {
		if (isSynced) {
			return (
				<Amount
					value={wallet.balance()}
					ticker={wallet.network().ticker()}
					className={cn(
						"dark:text-theme-white text-theme-secondary-700 dark:md:text-theme-secondary-500",
						className,
					)}
				/>
			);
		}

		return <Skeleton height={16} width={100} />;
	};

	if (!isLargeScreen) {
		return renderAmount();
	}

	return <TableCell innerClassName="font-semibold justify-end">{renderAmount()}</TableCell>;
};

export const RecipientItemMobile: React.FC<RecipientItemMobileProperties> = ({
	onClick,
	selected = false,
	type,
	address,
	name,
}) => {
	const { isSmAndAbove } = useBreakpoint();
	const maxCharacters = isSmAndAbove ? 20 : 10;

	return (
		<div
			data-testid={selected ? "WalletListItemMobile--selected" : "WalletListItemMobile"}
			className={cn(
				"flex w-full cursor-pointer flex-row rounded-xl border-2 bg-theme-primary-100 dark:bg-theme-background",
				{
					"border-theme-primary-100 dark:border-theme-secondary-800": !selected,
					"border-theme-primary-600 dark:border-theme-primary-600": selected,
				},
			)}
			tabIndex={onClick ? 0 : -1}
			onClick={onClick}
		>
			<div className="flex h-full w-full flex-col items-start justify-center gap-1.5 p-4">
				<div className="flex flex-row gap-1.5">
					<span className="truncate text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
						<TruncateEnd text={name} maxChars={maxCharacters} showTooltip={name.length > maxCharacters} />
					</span>
					<span className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
						({type})
					</span>
				</div>

				{address}
			</div>
			<div
				className={cn("flex w-11 items-center justify-center", {
					"rounded-r-lg bg-theme-primary-600 dark:bg-theme-primary-600": selected,
					"rounded-r-xl bg-theme-primary-100 dark:bg-theme-background": !selected,
				})}
			>
				<div>
					<Icon
						className={cn({
							"text-theme-primary-200 dark:text-theme-secondary-800": !selected,
							"text-theme-primary-50": selected,
						})}
						name="CircleCheckMark"
						size="lg"
					/>
				</div>
			</div>
		</div>
	);
};

export const ReceiverItemMobile: React.FC<ReceiverItemMobileProperties> = ({
	onClick,
	selected = false,
	balance,
	address,
	name,
}) => {
	const { t } = useTranslation();

	return (
		<div
			data-testid={selected ? "ReceiverItemMobile--selected" : "ReceiverItemMobile"}
			className={cn(
				"flex h-[117px] w-full cursor-pointer flex-col gap-3 rounded-xl bg-theme-primary-100 p-2 ring-2 dark:bg-theme-background",
				{
					"ring-theme-primary-100 dark:ring-theme-secondary-800": !selected,
					"ring-theme-primary-600 dark:ring-theme-primary-600": selected,
				},
			)}
			tabIndex={onClick ? 0 : -1}
			onClick={onClick}
		>
			<div className="flex flex-col gap-2 pl-2 pt-2">
				<span className="w-full max-w-48 truncate text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200 xs:max-w-80 sm:max-w-128">
					{name}
				</span>
				<span className="text-xs font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
					{address}
				</span>
			</div>

			<div className="flex flex-row items-center justify-between overflow-hidden rounded-lg bg-theme-primary-500 text-sm font-semibold text-white">
				<div className="pl-2">{balance}</div>
				<button className="flex h-full items-center justify-center bg-theme-primary-600 px-5 py-3">
					{t("COMMON.SELECT")}
				</button>
			</div>
		</div>
	);
};
