import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@ardenthq/sdk-profiles";
import { Divider } from "@/app/components/Divider";
import { useResizeDetector } from "react-resize-detector";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";

export const TransactionType = ({
	transaction,
}: {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}) => {
	const { t } = useTranslation();
	const { ref, width } = useResizeDetector<HTMLElement>({ handleHeight: false });

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
							<div> {transaction.username()} </div>
						</div>
					</>
				)}

				{transaction.isDelegateResignation() && (
					<>
						<DetailDivider />

						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText>{t("COMMON.DELEGATE")}</DetailLabelText>
							<div> {transaction.wallet().username()} </div>
						</div>
					</>
				)}

				{transaction.isIpfs() && (
					<div>
						<DetailDivider />

						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText>{t("COMMON.HASH")}</DetailLabelText>
							<div ref={ref} className="flex w-full">
								<TruncateMiddleDynamic
									availableWidth={width}
									value={transaction.hash()}
									parentRef={ref}
								/>
							</div>
						</div>
					</div>
				)}
			</DetailWrapper>
		</div>
	);
};
