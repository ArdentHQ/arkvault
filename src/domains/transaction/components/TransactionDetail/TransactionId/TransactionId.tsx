import React, { ReactElement } from "react";
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
	transaction: DTO.ExtendedSignedTransactionData;
}

export const TransactionId = ({ transaction }: Properties): ReactElement => {
	const { t } = useTranslation();
	const { ref, width } = useResizeDetector<HTMLElement>({ handleHeight: false });
	const { isDarkMode } = useTheme();
	const { isSmAndAbove } = useBreakpoint();
	const { openExternal } = useLink();

	return (
		<div
			data-testid="TransactionId"
			className="flex-row items-center sm:flex sm:rounded-lg sm:border sm:border-theme-secondary-300 sm:dark:border-theme-secondary-800"
		>
			<div className="mb-2 whitespace-nowrap font-semibold text-theme-secondary-700 dark:text-theme-secondary-500 sm:mb-0 sm:h-full sm:rounded-l-lg sm:bg-theme-secondary-200 sm:p-4 sm:dark:bg-black">
				{t("TRANSACTION.TRANSACTION_ID")}
			</div>

			<div ref={ref} className="w-full font-semibold sm:px-4">
				<TruncateMiddleDynamic value={transaction.id()} availableWidth={width} />
			</div>

			<div className="mt-4 flex space-x-2 sm:mr-4 sm:mt-0">
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

				<Button
					data-testid="explorer-link"
					icon="External"
					variant="secondary"
					size="icon"
					disabled={transaction.isConfirmed()}
					onClick={() => {
						openExternal(transaction.explorerLink());
					}}
				/>
			</div>
		</div>
	);
};
