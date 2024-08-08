import React, { ReactElement } from "react";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { Divider } from "@/app/components/Divider";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Button } from "@/app/components/Button";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useResizeDetector } from "react-resize-detector";
import { Clipboard } from "@/app/components/Clipboard";
import { useTheme } from "@emotion/react";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData
}

export const TransactionId = ({ transaction }: Properties): ReactElement => {
	const { t } = useTranslation();
	const { ref } = useResizeDetector<HTMLSpanElement>({ handleHeight: false });
	const { isDarkMode } = useTheme();

	return (
		<div className="flex items-center rounded-lg border-theme-secondary-300 dark:border-theme-secondary-800 border">
			<div className="h-full whitespace-nowrap bg-theme-secondary-200 text-theme-secondary-700 dark:text-theme-secondary-500 dark:bg-black p-4 rounded-l-lg font-semibold">
				{t("TRANSACTION.TRANSACTION_ID")}
			</div>

			<div ref={ref} className="w-full px-4 font-semibold">
				<TruncateMiddleDynamic value={transaction.id()} offset={24} parentRef={ref} />
			</div>

			<div className="flex space-x-2 mr-4">

				<Clipboard
					variant="icon"
					data={transaction.id()}
					tooltip={t("COMMON.COPY_ID")}
					tooltipDarkTheme={isDarkMode}
				>
					<Button icon="Copy" variant="secondary" size="icon" />
				</Clipboard>
				<Button icon="External" variant="secondary" size="icon" disabled />
			</div>
		</div>
	);
};
