import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";
import { Divider } from "@/app/components/Divider";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useResizeDetector } from "react-resize-detector";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { DateTime } from "@ardenthq/sdk-intl";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}

export const TransactionDetails = ({ transaction }: Properties): ReactElement => {
	const { t } = useTranslation();
	const format = useTimeFormat();
	const { ref, width } = useResizeDetector<HTMLElement>({ handleHeight: false });
	const timestamp = transaction.timestamp() as DateTime

	return (
		<DetailWrapper label={t("COMMON.DETAILS")}>
			<div className="space-y-3 sm:space-y-0">
				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.TIMESTAMP")}</DetailLabelText>
					<div>{timestamp.format(format)}</div>
				</div>

				<div className="hidden h-8 w-full items-center sm:flex">
					<Divider dashed />
				</div>

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.BLOCK_ID")}</DetailLabelText>
					<div ref={ref} className="w-full">
						<TruncateMiddleDynamic value={transaction.wallet().transaction()} availableWidth={width} />
					</div>
				</div>

				<div className="hidden h-8 w-full items-center sm:flex">
					<Divider dashed />
				</div>

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.NONCE")}</DetailLabelText>
					<div>10</div>
				</div>

			</div>
		</DetailWrapper >
	);
};
