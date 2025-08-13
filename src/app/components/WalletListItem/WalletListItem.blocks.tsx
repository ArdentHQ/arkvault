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
	ReceiverItemProperties,
} from "@/app/components/WalletListItem/WalletListItem.contracts";
import { useBreakpoint } from "@/app/hooks";
import { Skeleton } from "@/app/components/Skeleton";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";
import { Button } from "@/app/components/Button";
import { Address } from "@/app/components/Address";
import { Tooltip } from "@/app/components/Tooltip";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { Contracts } from "@/app/lib/profiles";
import { TFunction } from "i18next";

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

const getTooltipContent = (wallet: Contracts.IReadWriteWallet, t: TFunction): string => {
	if (wallet.balance() === 0) {
		return t("COMMON.DISABLED_DUE_INSUFFICIENT_BALANCE");
	}

	return t("TRANSACTION.TRANSACTION_TYPE_NOT_AVAILABLE");
};

export const ReceiverItemMobile: React.FC<ReceiverItemMobileProperties> = ({
	onClick,
	selected = false,
	wallet,
	disabled,
	name,
}) => {
	const { t } = useTranslation();

	return (
		<MultiEntryItem
			dataTestId="ReceiverItemMobile"
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
					<Tooltip content={getTooltipContent(wallet, t)} disabled={!disabled}>
						<div>
							<Button
								onClick={onClick}
								disabled={disabled}
								data-testid="ReceiverItemMobile--Select"
								size="icon"
								className={cn("p-0 text-sm leading-[17px]", {
									"text-theme-navy-600 dark:text-theme-secondary-500 dim:text-theme-dim-50":
										!selected,
									"text-theme-success-600 dark:text-theme-green-600 dim:text-theme-green-600":
										selected,
								})}
								variant="transparent"
							>
								{selected ? t("COMMON.SELECTED") : t("COMMON.SELECT")}
							</Button>
						</div>
					</Tooltip>
				</div>
			}
			bodySlot={
				<div>
					<div className="space-y-4">
						<InfoDetail
							label={t("COMMON.ADDRESS")}
							body={
								<div className="max-w-100">
									<Address
										showCopyButton={true}
										truncateOnTable={true}
										address={wallet.address()}
										addressClass="leading-[17px] text-sm text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50"
									/>
								</div>
							}
						/>
						<InfoDetail
							label={t("COMMON.BALANCE")}
							body={
								<Amount
									ticker={wallet.currency()}
									value={wallet.balance()}
									className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold"
								/>
							}
						/>
					</div>
				</div>
			}
		/>
	);
};

export const ReceiverItem: React.FC<ReceiverItemProperties> = ({
	onClick,
	selected = false,
	name,
	wallet,
	exchangeCurrency,
	disabled,
	index,
}) => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="ReceiverItem"
			className={cn("group cursor-pointer items-center rounded-lg border transition-all", {
				"border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700 hover:bg-theme-navy-100 dark:hover:bg-theme-dark-700 dim-hover:bg-theme-dim-700":
					!selected,
				"border-theme-success-200 dark:border-theme-success-700 dim:border-theme-success-700 bg-theme-success-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950":
					selected,
				"hover:bg-theme-secondary-200 hover:border-theme-navy-200 dark:hover:bg-theme-dark-700 dark:hover:border-theme-dark-700 dim-hover:bg-theme-dim-700 dim:hover:border-theme-dim-700":
					selected,
			})}
		>
			<div className="flex items-center px-4 py-3 duration-150">
				<div className="border-theme-primary-200 text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200 dim:border-theme-dim-700 dim:text-theme-dim-200 flex w-full min-w-0 items-center justify-between border-r pr-4 font-semibold">
					<div className="flex w-1/2 min-w-0 flex-col space-y-2 truncate">
						<div
							className={cn("text-sm leading-5", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-50 dim:group-hover:text-theme-dim-50":
									!selected,
								"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50": selected,
							})}
						>
							{name}
						</div>
						<Address
							address={wallet.address()}
							addressClass={cn(
								"text-sm leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200",
							)}
						/>
					</div>
					<div className="flex w-1/2 min-w-0 flex-col items-end space-y-2 self-start">
						<Amount
							ticker={wallet.currency()}
							value={wallet.balance()}
							className={cn("leading-5", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-50 dim:group-hover:text-theme-dim-50":
									!selected,
								"text-theme-primary-900 dark:text-theme-dark-50 dim:text-theme-dim-50": selected,
							})}
						/>

						{wallet.network().isLive() && (
							<div data-testid="ReceiverItem--exchangeAmount" className="leading-[17px]">
								<Amount
									ticker={exchangeCurrency}
									value={wallet.convertedBalance()}
									className="text-sm leading-[17px]"
								/>
							</div>
						)}
					</div>
				</div>

				<div className="flex w-[72px] min-w-[72px] flex-1 shrink-0 items-center justify-center pl-4">
					<Tooltip content={getTooltipContent(wallet, t)} disabled={!disabled}>
						<div>
							<Button
								disabled={disabled || !isLedgerWalletCompatible(wallet)}
								onClick={onClick}
								data-testid={
									selected
										? `SearchWalletListItem__selected-${index}`
										: `SearchWalletListItem__select-${index}`
								}
								size="icon"
								className={cn("p-0 text-sm leading-[17px]", {
									"group-hover:text-theme-navy-700 dark:group-hover:text-theme-navy-500 dim:group-hover:text-theme-navy-700":
										!selected,
									"group-hover:text-theme-success-700 dark:group-hover:text-theme-green-500 dim:group-hover:text-theme-green-500":
										selected,
									"text-theme-navy-600 dark:text-theme-navy-400 dim:text-theme-navy-600": !selected,
									"text-theme-success-600 dark:text-theme-green-600 dim:text-theme-green-600":
										selected,
								})}
								variant="transparent"
							>
								{selected ? t("COMMON.SELECTED") : t("COMMON.SELECT")}
							</Button>
						</div>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
