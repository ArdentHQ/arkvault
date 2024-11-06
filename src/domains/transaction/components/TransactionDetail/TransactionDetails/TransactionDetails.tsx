import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { Link } from "@/app/components/Link";
import { useBlockHeight } from "@/domains/transaction/hooks/use-block-height";

export const TransactionDetails = ({
	transaction,
	labelClassName,
}: {
	transaction: DTO.RawTransactionData;
	labelClassName?: string;
}): ReactElement => {
	const { t } = useTranslation();
	const format = useTimeFormat();

	const timestamp = transaction.timestamp();
	const { blockHeight } = useBlockHeight({
		blockId: transaction.blockId(),
		network: transaction.wallet().network(),
	});

	return (
		<DetailWrapper label={t("TRANSACTION.TRANSACTION_DETAILS")}>
			<div className="space-y-3 sm:space-y-0">
				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.TIMESTAMP")}</DetailLabelText>
					<div className="text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
						{timestamp.format(format)}
					</div>
				</div>

				<DetailDivider />

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.BLOCK")}</DetailLabelText>
					{transaction.blockId() && (
						<Link
							isExternal
							to={transaction.explorerLinkForBlock() as string}
							className="h-5 text-sm leading-[17px] sm:text-base sm:leading-5"
						>
							{blockHeight}
						</Link>
					)}

					{!transaction.blockId() && (
						<p className="text-sm leading-[17px] text-theme-secondary-500 sm:text-base sm:leading-5">
							{t("COMMON.NOT_AVAILABLE")}
						</p>
					)}
				</div>

				<DetailDivider />

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.NONCE")}</DetailLabelText>
					<div className="text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">{transaction.nonce()}</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
