import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { useResizeDetector } from "react-resize-detector";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { useTheme } from "@/app/hooks";
import { DTO } from "@ardenthq/sdk-profiles";
import { MusigGeneratedAddress } from "@/domains/transaction/components/TransactionDetail/MusigGeneratedAddress/MusigGeneratedAddress";
import { transactionPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";

export const TransactionType = ({
	transaction,
}: {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}) => {
	const { t } = useTranslation();
	const { ref, width } = useResizeDetector<HTMLElement>({ handleHeight: false });
	const { isDarkMode } = useTheme();

	const { getLabel } = useTransactionTypes();

	const { min, publicKeys } = transactionPublicKeys(transaction);

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
				<div className="space-y-3 sm:space-y-0">
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
						<div data-testid="DetailIpfs">
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

					{transaction.isMultiSignatureRegistration() && (
						<>
							<DetailDivider />

							<div className="flex w-full justify-between sm:justify-start">
								<DetailLabelText>{t("COMMON.ADDRESS")}</DetailLabelText>
								<div className="font-semibold max-sm:text-sm">
									<MusigGeneratedAddress
										publicKeys={publicKeys}
										min={min}
										wallet={transaction.wallet()}
									/>
								</div>
							</div>

							<DetailDivider />

							<div className="flex w-full items-center justify-between sm:justify-start">
								<DetailLabelText>{t("TRANSACTION.SIGNATURES")}</DetailLabelText>
								<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
									{min} {t("TRANSACTION.MULTISIGNATURE.OUT_OF_LENGTH", { length: publicKeys.length })}
								</div>
							</div>
						</>
					)}
				</div>
			</DetailWrapper>
		</div>
	);
};
