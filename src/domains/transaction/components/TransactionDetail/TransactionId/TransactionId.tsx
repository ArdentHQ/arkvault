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

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}

export const TransactionId = ({ transaction }: Properties): ReactElement => {
	const { t } = useTranslation();
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

			<div className="font-semibold sm:px-4 grow">
				<AddressLabel>{transaction.id()}</AddressLabel>
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
						<Button variant="secondary" className="w-full">
							<Icon name="Copy" />
							<div>{t("COMMON.COPY")}</div>
						</Button>
					)}

					{isSmAndAbove && <Button icon="Copy" variant="secondary" size="icon" />}
				</Clipboard>

				<Button
					data-testid="explorer-link"
					icon="ArrowExternal"
					variant="border"
					size="icon"
					disabled={!transaction.isConfirmed()}
					onClick={() => {
						openExternal(transaction.explorerLink());
					}}
				/>
			</div>
		</div>
	);
};
