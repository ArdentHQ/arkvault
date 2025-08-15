import React, { ReactElement, useEffect, useRef, useState } from "react";
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

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
		}
	}, [mounted]);

	return (
		<div
			data-testid="TransactionId"
			className="sm:border-theme-secondary-300 sm:dark:border-theme-secondary-800 sm:dim:border-theme-dim-700 flex-row items-center sm:flex sm:rounded-lg sm:border"
		>
			<div className="text-theme-secondary-700 sm:bg-theme-secondary-200 dark:text-theme-secondary-500 sm:dim:bg-theme-dim-950 dim:text-theme-dim-200 mb-2 text-sm leading-[17px] font-semibold whitespace-nowrap sm:mb-0 sm:h-full sm:rounded-l-lg sm:px-4 sm:py-3 sm:text-base sm:leading-5 sm:dark:bg-black">
				{t("TRANSACTION.TRANSACTION_ID")}
			</div>

			<div ref={reference} className="flex-1 overflow-hidden font-semibold sm:mx-4">
				<TruncateMiddleDynamic value={transaction.hash()} parentRef={reference} />
			</div>

			<div className="mt-4 flex items-center space-x-2 sm:mt-0 sm:mr-4">
				<Clipboard
					variant={isSmAndAbove ? "icon" : "button"}
					data={transaction.hash()}
					tooltip={t("COMMON.COPY_ID")}
					tooltipDarkTheme={isDarkMode}
					iconButtonClassName={twMerge(
						getStyles({ variant: "secondary" }),
						"space-x-0 p-2 dim:border-theme-dim-600 dim:bg-theme-dim-700 dim:text-theme-dim-50",
					)}
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
					className="border-theme-secondary-300 dark:border-theme-secondary-800 dark:hover:border-theme-primary-500 dim:bg-transparent dim:border-theme-dim-700 dim:text-theme-dim-navy-600 dim-hover:border-theme-dim-navy-700 h-8 w-8 border bg-transparent p-2 hover:border-transparent dark:bg-transparent"
					disabled={[!isConfirmed, !transaction.isConfirmed()].every(Boolean)}
					onClick={() => {
						openExternal(transaction.explorerLink());
					}}
				/>
			</div>
		</div>
	);
};
