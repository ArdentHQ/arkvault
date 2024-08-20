import React, { ReactElement } from "react";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";
import { useBreakpoint } from "@/app/hooks";
import { Button } from "@/app/components/Button";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useResizeDetector } from "react-resize-detector";
import { Clipboard } from "@/app/components/Clipboard";
import { useTheme } from "@/app/hooks/use-theme";
import { Icon } from "@/app/components/Icon";
import { useLink } from "@/app/hooks/use-link";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData
}

export const TransactionId = ({ transaction }: Properties): ReactElement => {
	const { t } = useTranslation();
	const { ref } = useResizeDetector<HTMLSpanElement>({ handleHeight: false });
	const { isDarkMode } = useTheme();
	const { isSmAndAbove } = useBreakpoint();
	const { openExternal } = useLink()


	return (
		<div className="flex-row sm:flex items-center sm:rounded-lg sm:border-theme-secondary-300 sm:dark:border-theme-secondary-800 sm:border">
			<div className="sm:h-full whitespace-nowrap mb-2 sm:mb-0 sm:bg-theme-secondary-200 text-theme-secondary-700 dark:text-theme-secondary-500 sm:dark:bg-black sm:p-4 sm:rounded-l-lg font-semibold">
				{t("TRANSACTION.TRANSACTION_ID")}
			</div>

			<div ref={ref} className="w-full sm:px-4 font-semibold">
				<TruncateMiddleDynamic value={transaction.id()} offset={24} parentRef={ref} />
			</div>

			<div className="flex space-x-2 sm:mr-4 mt-4 sm:mt-0">
				<Clipboard
					variant={isSmAndAbove ? "icon" : "button"}
					data={transaction.id()}
					tooltip={t("COMMON.COPY_ID")}
					tooltipDarkTheme={isDarkMode}
					wrapperClassName="flex w-full"
					className="grow"
					buttonVariant="secondary"
				>
					{!isSmAndAbove && (
						<>
							<Icon name="Copy" />
							<div>{t("COMMON.COPY")}</div>
						</>
					)}

					{isSmAndAbove && <Button icon="Copy" variant="secondary" size="icon" />}
				</Clipboard>

				<Button icon="External" variant="secondary" size="icon" disabled={transaction.isConfirmed()} onClick={() => {
					openExternal(transaction.explorerLink())
				}} />
			</div>
		</div >
	);
};
