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
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";
import { Button } from "@/app/components/Button";
import { Address } from "@/app/components/Address";

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
		<MultiEntryItem
			dataTestId={selected ? "ReceiverItemMobile--selected" : "ReceiverItemMobile"}
			className={cn({
				"border-theme-success-200 dark:border-theme-success-700 dim:border-theme-success-700": selected,
			})}
			titleWrapperClassName={cn({ "bg-theme-success-100": selected })}
			titleSlot={
				<div className="flex w-full items-center justify-between">
					<div
						className={cn("max-w-56 truncate text-sm leading-[17px] font-semibold whitespace-nowrap", {
							"text-theme-secondary-700 dark:text-theme-secondary-200 dim:text-theme-dim-200": !selected,
							"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50": selected,
						})}
					>
						{name}
					</div>
					<Button
						onClick={onClick}
						data-testid="ReceiverItemMobile--Select"
						size="icon"
						className={cn("p-0 text-sm leading-[17px]", {
							"text-theme-navy-600 dark:text-theme-secondary-500 dim:text-theme-dim-50": !selected,
							"text-theme-success-600 dark:text-theme-green-600 dim:text-theme-green-600": selected,
						})}
						variant="transparent"
					>
						{selected ? t("COMMON.SELECTED") : t("COMMON.SELECT")}
					</Button>
				</div>
			}
			bodySlot={
				<div>
					<div className="space-y-4">
						<InfoDetail
							label={t("COMMON.ADDRESS")}
							body={
								<Address
									showCopyButton={true}
									truncateOnTable={true}
									address={address}
									addressClass="leading-[17px] text-sm text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50"
								/>
							}
						/>
						<InfoDetail label={t("COMMON.BALANCE")} body={balance} />
					</div>
				</div>
			}
		/>
	);
};
