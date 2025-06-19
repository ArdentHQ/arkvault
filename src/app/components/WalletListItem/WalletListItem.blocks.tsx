import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { TableCell } from "@/app/components/Table";
import {
	BalanceProperties,
	RecipientItemMobileProperties,
	ReceiverItemMobileProperties,
} from "@/app/components/WalletListItem/WalletListItem.contracts";
import { useBreakpoint } from "@/app/hooks";
import { Skeleton } from "@/app/components/Skeleton";
import { TruncateEnd } from "@/app/components/TruncateEnd";

export const Balance = ({ wallet, isSynced, isLargeScreen = true, className }: BalanceProperties) => {
	const renderAmount = () => {
		if (isSynced) {
			return (
				<Amount
					value={wallet.balance()}
					ticker={wallet.network().ticker()}
					className={cn(
						"dark:text-theme-white text-theme-secondary-700 dark:md:text-theme-secondary-500 dim:text-theme-dim-50",
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

export const RecipientItemMobile = ({
	onClick,
	selected = false,
	type,
	address,
	name,
}: RecipientItemMobileProperties) => {
	const { isSmAndAbove } = useBreakpoint();
	const maxCharacters = isSmAndAbove ? 20 : 10;

	return (
		<div
			data-testid={selected ? "WalletListItemMobile--selected" : "WalletListItemMobile"}
			className={cn(
				"bg-theme-primary-100 dark:bg-theme-background flex w-full cursor-pointer flex-row rounded-xl border-2",
				{
					"border-theme-primary-100 dark:border-theme-secondary-800 dim:border-theme-dim-700": !selected,
					"border-theme-primary-600 dark:border-theme-primary-600 dim:border-theme-dim-navy-600": selected,
				},
			)}
			tabIndex={onClick ? 0 : -1}
			onClick={onClick}
		>
			<div className="flex h-full w-full flex-col items-start justify-center gap-1.5 p-4">
				<div className="flex flex-row gap-1.5">
					<span className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-200 truncate text-sm font-semibold">
						<TruncateEnd text={name} maxChars={maxCharacters} showTooltip={name.length > maxCharacters} />
					</span>
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 text-sm font-semibold">
						({type})
					</span>
				</div>

				{address}
			</div>
			<div
				className={cn("flex w-11 items-center justify-center", {
					"bg-theme-primary-100 dark:bg-theme-background rounded-r-xl": !selected,
					"bg-theme-primary-600 dark:bg-theme-primary-600 dim:bg-theme-dim-navy-600 rounded-r-lg": selected,
				})}
			>
				<div>
					<Icon
						className={cn({
							"text-theme-primary-200 dark:text-theme-secondary-800 dim:text-theme-dim-700": !selected,
							"text-theme-primary-50 dim:text-theme-dim-50": selected,
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
				"bg-theme-primary-100 dark:bg-theme-background flex h-[117px] w-full cursor-pointer flex-col gap-3 rounded-xl p-2 ring-2",
				{
					"ring-theme-primary-100 dark:ring-theme-secondary-800 dim:ring-theme-dim-700": !selected,
					"ring-theme-primary-600 dark:ring-theme-primary-600 dim:ring-theme-dim-navy-600": selected,
				},
			)}
			tabIndex={onClick ? 0 : -1}
			onClick={onClick}
		>
			<div className="flex flex-col gap-2 pt-2 pl-2">
				<span className="text-theme-secondary-900 xs:max-w-80 dark:text-theme-secondary-200 dim:text-theme-dim-200 w-full max-w-48 truncate text-sm font-semibold sm:max-w-128">
					{name}
				</span>
				<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 text-xs font-semibold">
					{address}
				</span>
			</div>

			<div className="bg-theme-primary-500 dim:bg-theme-dim-navy-600 dim:text-theme-dim-50 flex flex-row items-center justify-between overflow-hidden rounded-lg text-sm font-semibold text-white">
				<div className="pl-2">{balance}</div>
				<button className="bg-theme-primary-600 dim:bg-theme-dim-navy-600 flex h-full items-center justify-center px-5 py-3">
					{t("COMMON.SELECT")}
				</button>
			</div>
		</div>
	);
};
