import React, { ReactElement, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@/app/lib/profiles";
import { useBreakpoint } from "@/app/hooks";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { useTheme } from "@/app/hooks/use-theme";
import { Icon } from "@/app/components/Icon";
import { useLink } from "@/app/hooks/use-link";
import { getStyles } from "@/app/components/Button/Button.styles";
import { twMerge } from "tailwind-merge";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
	isConfirmed?: boolean;
}

export const TransactionId = ({ transaction, isConfirmed }: Properties): ReactElement => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();
	const { isSmAndAbove } = useBreakpoint();
	const { openExternal } = useLink();
	const reference = useRef(null);

	return (
		<div
			data-testid="TransactionId"
			className="flex-row items-center sm:flex sm:rounded-lg sm:border sm:border-theme-secondary-300 sm:dark:border-theme-secondary-800"
		>
			<div className="mb-2 text-sm font-semibold whitespace-nowrap sm:py-3 sm:px-4 sm:mb-0 sm:h-full sm:text-base sm:leading-5 sm:rounded-l-lg text-theme-secondary-700 leading-[17px] sm:bg-theme-secondary-200 sm:dark:bg-black dark:text-theme-secondary-500">
				{t("TRANSACTION.TRANSACTION_ID")}
			</div>

			<div ref={reference} className="overflow-hidden flex-1 font-semibold sm:mx-4">
				<TruncateMiddleDynamic value={transaction.hash()} parentRef={reference} />
			</div>

			<div className="flex items-center mt-4 space-x-2 sm:mt-0 sm:mr-4">
				<Clipboard
					variant={isSmAndAbove ? "icon" : "button"}
					data={transaction.hash()}
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
					className="p-2 w-8 h-8 bg-transparent border dark:bg-transparent hover:border-transparent border-theme-secondary-300 dark:border-theme-secondary-800 dark:hover:border-theme-primary-500"
					disabled={[!isConfirmed, !transaction.isConfirmed()].every(Boolean)}
					onClick={() => {
						openExternal(transaction.explorerLink());
					}}
				/>
			</div>
		</div>
	);
};
