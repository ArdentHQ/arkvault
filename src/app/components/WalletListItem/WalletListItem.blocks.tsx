import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { TableCell } from "@/app/components/Table";
import {
	BalanceProperties,
	RecipientItemMobileProperties,
	ReceiverItemMobileProperties,
	ReceiverItemProperties,
	RecipientItemProperties,
} from "@/app/components/WalletListItem/WalletListItem.contracts";
import { Skeleton } from "@/app/components/Skeleton";
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";
import { Button } from "@/app/components/Button";
import { Address } from "@/app/components/Address";
import { Tooltip } from "@/app/components/Tooltip";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { Contracts } from "@/app/lib/profiles";
import { TFunction } from "i18next";
import { Label } from "@/app/components/Label";
import { Divider } from "@/app/components/Divider";

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
	const { t } = useTranslation();

	return (
		<MultiEntryItem
			dataTestId="RecipientItemMobile"
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
						data-testid={selected ? "WalletListItemMobile--selected" : "WalletListItemMobile"}
						size="icon"
						className={cn("p-0 text-sm leading-[17px]", {
							"text-theme-navy-600 dark:text-theme-navy-400 dim:text-theme-navy-600": !selected,
							"text-theme-success-600 dark:text-theme-green-600 dim:text-theme-green-600": selected,
						})}
						variant="transparent"
					>
						{selected ? t("COMMON.SELECTED") : t("COMMON.SELECT")}
					</Button>
				</div>
			}
			bodySlot={
				<InfoDetail
					label={
						<div className="flex items-center gap-2">
							<span>{t("COMMON.ADDRESS")}</span>

							<Label
								color="secondary"
								size="xs"
								noBorder
								className="flex! h-[21px] shrink-0 items-center justify-center rounded px-1 py-[3px] dark:border"
							>
								{type}
							</Label>
						</div>
					}
					body={
						<div className="max-w-100">
							<Address
								showCopyButton={true}
								truncateOnTable={true}
								address={address}
								addressClass="leading-[17px] text-sm text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50"
							/>
						</div>
					}
				/>
			}
		/>
	);
};

export const RecipientItem: React.FC<RecipientItemProperties> = ({
	onClick,
	selected = false,
	type,
	index,
	address,
	name,
}) => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="RecipientItem"
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
					<div className="flex min-w-0 flex-col space-y-2 truncate">
						<div
							className={cn("text-sm leading-5", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-50 dim:group-hover:text-theme-dim-50":
									!selected,
								"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50": selected,
							})}
						>
							{name}
						</div>
						<div className="flex min-w-0 items-center gap-1">
							<Address
								showCopyButton={true}
								address={address}
								wrapperClass="w-52 min-w-52 justify-between"
								addressClass={cn(
									"text-sm leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200",
								)}
							/>

							<Divider type="vertical" />

							<Label
								color="secondary"
								size="xs"
								noBorder
								className="flex! h-[21px] shrink-0 items-center justify-center rounded px-1 py-[3px] dark:border dark:group-hover:border-theme-dark-500 dim:group-hover:border-theme-dim-500"
								data-testid="TransactionRowAddressing__label"
							>
								{type}
							</Label>
						</div>
					</div>
				</div>

				<div className="flex w-[72px] min-w-[72px] flex-1 shrink-0 items-center justify-center pl-4">
					<Button
						onClick={onClick}
						data-testid={
							selected
								? `RecipientListItem__selected-button-${index}`
								: `RecipientListItem__select-button-${index}`
						}
						size="icon"
						className={cn("p-0 text-sm leading-[17px]", {
							"group-hover:text-theme-navy-700 dark:group-hover:text-theme-navy-500 dim:group-hover:text-theme-navy-700":
								!selected,
							"group-hover:text-theme-success-700 dark:group-hover:text-theme-green-500 dim:group-hover:text-theme-green-500":
								selected,
							"text-theme-navy-600 dark:text-theme-navy-400 dim:text-theme-navy-600": !selected,
							"text-theme-success-600 dark:text-theme-green-600 dim:text-theme-green-600": selected,
						})}
						variant="transparent"
					>
						{selected ? t("COMMON.SELECTED") : t("COMMON.SELECT")}
					</Button>
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
