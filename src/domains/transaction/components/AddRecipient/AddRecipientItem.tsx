import React, { VFC } from "react";

import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Address } from "@/app/components/Address";
import { Icon } from "@/app/components/Icon";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { Amount } from "@/app/components/Amount";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";

export const AddRecipientItem: VFC<{
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
		<div
			data-testid="AddRecipientItem"
			className="border-b border-dashed border-theme-secondary-300 py-3 last:border-none last:pb-0 dark:border-theme-secondary-800"
		>
			<div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
				<div className="flex w-full flex-1 flex-row items-center space-x-4 overflow-auto sm:flex-col sm:items-start sm:space-x-0 sm:space-y-1">
					<div className="whitespace-nowrap text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("COMMON.RECIPIENT_#", { count: index + 1 })}
					</div>
					<div className="max-w-full overflow-auto sm:w-full">
						<Address address={address} walletName={alias} />
					</div>
				</div>

				<div className="flex w-full flex-row items-center space-x-4 overflow-auto sm:w-auto sm:flex-col sm:items-start sm:space-x-0 sm:space-y-1 sm:pl-7">
					<div className="whitespace-nowrap font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{showExchangeAmount ? (
							<>
								<span data-testid="AddRecipientItem--exchangeAmount" className="hidden sm:inline">
									<Amount ticker={exchangeTicker} value={convert(amount)} />
								</span>
								<span className="sm:hidden">{t("COMMON.AMOUNT")}</span>
							</>
						) : (
							<span className="text-sm">{t("COMMON.AMOUNT")}</span>
						)}
					</div>
					<div className="flex flex-1 justify-end font-semibold text-theme-secondary-700 dark:text-theme-secondary-200 sm:text-theme-secondary-900">
						<Amount ticker={ticker} value={amount!} />
					</div>
				</div>

				<div className="w-full sm:w-auto">
					<Button
						variant="danger"
						onClick={() => onDelete(index)}
						data-testid="AddRecipientItem--deleteButton"
						className="w-full sm:w-auto"
					>
						<div className="flex items-center space-x-2 py-1">
							<Icon name="Trash" />
							<div className="block sm:hidden">{t("COMMON.REMOVE")}</div>
						</div>
					</Button>
				</div>
			</div>
		</div>
	);
};
