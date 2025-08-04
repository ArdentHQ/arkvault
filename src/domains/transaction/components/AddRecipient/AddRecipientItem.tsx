import React from "react";

import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Address } from "@/app/components/Address";
import { Icon } from "@/app/components/Icon";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { Amount } from "@/app/components/Amount";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { MultiEntryItem, InfoDetail } from "@/app/components/MultiEntryItem/MultiEntryItem";
import { IProfile } from "@/app/lib/profiles/contracts";
import { useBreakpoint } from "@/app/hooks";
import cn from "classnames";

export const AddRecipientItem: React.FC<{
	index: number;
	recipient: RecipientItem;
	ticker: string;
	exchangeTicker: string;
	showExchangeAmount: boolean;
	profile: IProfile;
	onDelete: (index: number) => void;
}> = ({
	recipient: { address, alias, amount },
	index,
	onDelete,
	ticker,
	exchangeTicker,
	showExchangeAmount,
	profile,
}) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	if (isXs) {
		return (
			<MultiEntryItem
				dataTestId="AddRecipientItem--mobile"
				titleSlot={
					<div className="flex w-full items-center justify-between">
						<div className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 text-sm leading-[17px] font-semibold whitespace-nowrap">
							{t("COMMON.RECIPIENT_#", { count: index + 1 })}
						</div>
						<Button
							onClick={() => onDelete(index)}
							data-testid="AddRecipientItem--deleteButton_mobile"
							size="icon"
							className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-50 p-0"
							variant="transparent"
						>
							<Icon name="Trash" size="md" />
						</Button>
					</div>
				}
				bodySlot={
					<div>
						<div className="space-y-4">
							<InfoDetail
								label="Address"
								body={
									<Address
										address={address}
										walletName={alias}
										walletNameClass="leading-[17px] text-sm"
										addressClass="leading-[17px] text-sm text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200"
									/>
								}
							/>
							<InfoDetail
								label="Value"
								body={
									<Amount
										ticker={ticker}
										value={amount!}
										className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold"
									/>
								}
							/>
						</div>
					</div>
				}
				rightSlot={
					<div className="flex items-center gap-3">
						<div className="flex flex-col items-end space-y-2">
							<div className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 leading-[17px] font-semibold whitespace-nowrap">
								{!showExchangeAmount && (
									<span className="text-sm leading-[17px]">{t("COMMON.AMOUNT")}</span>
								)}
							</div>
							<Amount
								ticker={ticker}
								value={amount!}
								className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 leading-5 font-semibold"
							/>
						</div>
					</div>
				}
			/>
		);
	}

	return (
		<RecipientRow
			index={index}
			onDelete={onDelete}
			address={address}
			alias={alias}
			amount={amount!}
			ticker={ticker}
			exchangeTicker={exchangeTicker}
			convertedAmount={convert(amount)}
			showExchangeAmount={showExchangeAmount}
		/>
	);
};

const RecipientRow = ({
	ticker,
	amount,
	index,
	onDelete,
	address,
	alias,
	exchangeTicker,
	convertedAmount,
	showExchangeAmount,
}: {
	index: number;
	onDelete: (index: number) => void;
	address: string;
	alias: string | undefined;
	amount: number;
	ticker: string;
	exchangeTicker: string;
	convertedAmount: number;
	showExchangeAmount: boolean;
}) => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="AddRecipientItem"
			className="group border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700 hover:bg-theme-navy-100 dark:hover:bg-theme-dark-700 dim-hover:bg-theme-dim-700 cursor-pointer items-center rounded-lg border transition-all"
		>
			<div className="flex items-center px-4 py-3 duration-150">
				<Button
					onClick={() => onDelete(index)}
					data-testid={`AddRecipientItem--deleteButton-${index}`}
					size="icon"
					className="text-theme-secondary-700 dark:text-theme-secondary-500 hover:bg-theme-danger-400 dim:text-theme-dim-200 dim-hover:text-white p-1 hover:text-white dark:hover:text-white"
					variant="transparent"
				>
					<Icon name="Trash" dimensions={[16, 16]} />
				</Button>

				<div className="border-theme-primary-200 text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200 dim:border-theme-dim-700 dim:text-theme-dim-200 ml-4 flex w-full min-w-0 items-center justify-between border-l pl-4 font-semibold">
					<div className="flex w-1/2 min-w-0 flex-col space-y-2 truncate">
						<div className="group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200 dim:group-hover:text-theme-dim-50 text-sm leading-[17px]">
							{t("COMMON.RECIPIENT_#", { count: index + 1 })}
						</div>
						<Address
							walletName={alias}
							address={address}
							walletNameClass="leading-5 text-theme-text"
							addressClass={cn({
								"leading-5 text-theme-text": !alias,
								"text-sm leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200":
									alias,
							})}
						/>
					</div>
					<div className="flex w-1/2 min-w-0 flex-col items-end space-y-2 self-end">
						{showExchangeAmount && (
							<div data-testid="AddRecipientItem--exchangeAmount">
								<Amount
									ticker={exchangeTicker}
									value={convertedAmount}
									className="text-sm leading-[17px]"
								/>
							</div>
						)}

						<Amount
							ticker={ticker}
							value={amount}
							className="group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200 dim:group-hover:text-theme-dim-50 leading-5"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
