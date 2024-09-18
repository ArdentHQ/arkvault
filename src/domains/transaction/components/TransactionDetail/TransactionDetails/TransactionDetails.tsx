import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk";
import { Divider } from "@/app/components/Divider";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { Link } from "@/app/components/Link";
import { useBlockHeight } from "@/domains/transaction/hooks/use-block-height";

export const TransactionDetails = ({ transaction }: { transaction: DTO.RawTransactionData }): ReactElement => {
	const { t } = useTranslation();
	const format = useTimeFormat();

	const timestamp = transaction.timestamp();
	const data = transaction.data().data;

	const { blockHeight } = useBlockHeight({
		blockId: transaction.blockId(),
		network: transaction.wallet().network(),
	});

	return (
		<DetailWrapper label={t("TRANSACTION.TRANSACTION_DETAILS")}>
			<div className="space-y-3 sm:space-y-0">
				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.TIMESTAMP")}</DetailLabelText>
					<div className="font-semibold">{timestamp.format(format)}</div>
				</div>

				<DetailDivider />

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.BLOCK")}</DetailLabelText>
					<Link isExternal to={transaction.explorerLinkForBlock() as string}>
						{blockHeight}
					</Link>
				</div>

				<DetailDivider />

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.NONCE")}</DetailLabelText>
					<div className="font-semibold">{data.nonce}</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
