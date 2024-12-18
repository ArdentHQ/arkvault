import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";
import { useBreakpoint } from "@/app/hooks";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { useTheme } from "@/app/hooks/use-theme";
import { Icon } from "@/app/components/Icon";
import { useLink } from "@/app/hooks/use-link";
import { AddressLabel } from "@/app/components/Address";
import { getStyles } from "@/app/components/Button/Button.styles";
import { twMerge } from "tailwind-merge";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
	isConfirmed?: boolean;
}

export const TransactionId = ({ transaction, isConfirmed }: Properties): ReactElement => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();
	const { isSmAndAbove } = useBreakpoint();
	const { openExternal } = useLink();

	return (
		<div
			data-testid="TransactionId"
			className="flex-row items-center sm:flex sm:rounded-lg sm:border sm:border-theme-secondary-300 sm:dark:border-theme-secondary-800"
		>
			<div className="mb-2 whitespace-nowrap text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500 sm:mb-0 sm:h-full sm:rounded-l-lg sm:bg-theme-secondary-200 sm:px-4 sm:py-3 sm:text-base sm:leading-5 sm:dark:bg-black">
				{t("TRANSACTION.TRANSACTION_ID")}
			</div>

			<div className="grow font-semibold sm:px-4">
				<AddressLabel>{transaction.id()}</AddressLabel>
			</div>

			<div className="mt-4 flex items-center space-x-2 sm:mr-4 sm:mt-0">
				<Clipboard
					variant={isSmAndAbove ? "icon" : "button"}
					data={transaction.id()}
					tooltip={t("COMMON.COPY_ID")}
					tooltipDarkTheme={isDarkMode}
					iconButtonClassName={twMerge(getStyles({ variant: "secondary" }), "space-x-0 p-2")}
					buttonClassName="h-8 grow"
					wrapperClassName="flex w-full"
				>
					<Icon name="Copy" />
					<span className="sm:hidden">{t("COMMON.COPY")}</span>
				</Clipboard>

				<Button
					data-testid="explorer-link"
					icon="ArrowExternal"
					variant="secondary"
					size="icon"
					className="h-8 w-8 border border-theme-secondary-300 bg-transparent p-2 hover:border-transparent dark:border-theme-secondary-800 dark:bg-transparent dark:hover:border-theme-primary-500"
					disabled={[!isConfirmed, !transaction.isConfirmed()].every(Boolean)}
					onClick={() => {
						openExternal(transaction.explorerLink());
					}}
				/>
			</div>
		</div>
	);
};
