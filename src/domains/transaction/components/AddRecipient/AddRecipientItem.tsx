import React from "react";

import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Address } from "@/app/components/Address";
import { Icon } from "@/app/components/Icon";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { Amount } from "@/app/components/Amount";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { MultiEntryItem, InfoDetail } from "@/app/components/MultiEntryItem/MultiEntryItem";

export const AddRecipientItem: React.FC<{
	index: number;
	recipient: RecipientItem;
	ticker: string;
	exchangeTicker: string;
	showExchangeAmount: boolean;
	onDelete: (index: number) => void;
}> = ({ recipient: { address, alias, amount }, index, onDelete, ticker, exchangeTicker, showExchangeAmount }) => {
	const { t } = useTranslation();
	const { convert } = useExchangeRate({ exchangeTicker, ticker });

	return (
		<MultiEntryItem
			dataTestId="AddRecipientItem"
			titleSlot={
				<div className="flex w-full items-center justify-between">
					<div className="whitespace-nowrap text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500">
						{t("COMMON.RECIPIENT_#", { count: index + 1 })}
					</div>
					<Button
						onClick={() => onDelete(index)}
						size="icon"
						sizeClassName="p-0"
						className="text-theme-secondary-700 dark:text-theme-secondary-500 sm:hidden"
						variant="transparent"
					>
						<Icon name="Trash" size="lg" />
					</Button>
				</div>
			}
			bodySlot={
				<div>
					<div className="mt-1 hidden leading-5 sm:block">
						<Address
							address={address}
							walletName={alias}
							addressClass="leading-5 text-theme-secondary-500 dark:text-theme-secondary-700"
							walletNameClass="leading-5"
						/>
					</div>
					<div className="space-y-4 sm:hidden">
						<InfoDetail
							label="Address"
							body={
								<Address
									address={address}
									walletName={alias}
									walletNameClass="leading-[17px] text-sm"
									addressClass="leading-[17px] text-sm text-theme-secondary-500 dark:text-theme-secondary-700"
								/>
							}
						/>
						<InfoDetail
							label="Value"
							body={
								<Amount
									ticker={ticker}
									value={amount!}
									className="text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200"
								/>
							}
						/>
					</div>
				</div>
			}
			rightSlot={
				<div className="flex items-center gap-3">
					<div className="flex flex-col items-end space-y-2">
						<div className="whitespace-nowrap font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500">
							{showExchangeAmount ? (
								<span data-testid="AddRecipientItem--exchangeAmount" className="hidden sm:inline">
									<Amount
										ticker={exchangeTicker}
										value={convert(amount)}
										className="text-sm leading-[17px]"
									/>
								</span>
							) : (
								<span className="text-sm leading-[17px]">{t("COMMON.AMOUNT")}</span>
							)}
						</div>
						<Amount
							ticker={ticker}
							value={amount!}
							className="font-semibold leading-5 text-theme-secondary-900 dark:text-theme-secondary-200"
						/>
					</div>
					<Button
						variant="danger"
						onClick={() => onDelete(index)}
						data-testid="AddRecipientItem--deleteButton"
						className="h-11 w-11 p-2.5"
					>
						<Icon name="Trash" />
					</Button>
				</div>
			}
		/>
	);
};
