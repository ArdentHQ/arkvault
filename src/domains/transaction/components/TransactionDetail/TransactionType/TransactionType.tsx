import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@ardenthq/sdk-profiles";
import { useResizeDetector } from "react-resize-detector";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { useTheme } from "@/app/hooks";

export const TransactionType = ({
	transaction,
}: {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}) => {
	const { t } = useTranslation();
	const { ref, width } = useResizeDetector<HTMLElement>({ handleHeight: false });
	const { isDarkMode } = useTheme();

	const { getLabel } = useTransactionTypes();

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.CATEGORY")}</DetailLabelText>
					<Label color="neutral" size="xs">
						{getLabel(transaction.type())}
					</Label>
				</div>

				{transaction.isDelegateRegistration() && (
					<>
						<DetailDivider />

						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText>{t("COMMON.DELEGATE")}</DetailLabelText>
							<div className="font-semibold">{transaction.username()}</div>
						</div>
					</>
				)}

				{transaction.isDelegateResignation() && (
					<>
						<DetailDivider />

						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText>{t("COMMON.DELEGATE")}</DetailLabelText>
							<div className="font-semibold"> {transaction.wallet().username()} </div>
						</div>
					</>
				)}

				{transaction.isIpfs() && (
					<div>
						<DetailDivider />

						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText>{t("COMMON.HASH")}</DetailLabelText>
							<div className="flex w-full space-x-2">
								<div ref={ref} className="flex w-full">
									<TruncateMiddleDynamic
										availableWidth={width}
										value={transaction.hash()}
										parentRef={ref}
										className="font-semibold"
									/>
								</div>
								<Clipboard
									variant="icon"
									data={transaction.hash()}
									tooltip={t("COMMON.COPY_IPFS")}
									tooltipDarkTheme={isDarkMode}
								>
									<Icon
										name="Copy"
										className="text-theme-primary-400 dark:text-theme-secondary-700 dark:hover:text-theme-secondary-500"
									/>
								</Clipboard>
							</div>
						</div>
					</div>
				)}
			</DetailWrapper>
		</div>
	);
};
