import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";
import { Divider } from "@/app/components/Divider";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { DateTime, Numeral } from "@ardenthq/sdk-intl";
import { Link } from "@/app/components/Link";
import { HttpClient } from "@/app/services/HttpClient";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}

export const TransactionDetails = ({ transaction }: Properties): ReactElement => {
	const { t } = useTranslation();
	const format = useTimeFormat();

	const timestamp = transaction.timestamp() as DateTime;
	const data = transaction.data().data as Record<string, string>;
	console.log({ transaction });

	const client = new HttpClient(0);
	const [blockHeight, setBlockHeight] = useState<string>();

	useEffect(() => {
		// @TODO: Fetch block info/height from sdk (not yet supported).
		const fetchBlockHeight = async () => {
			const {
				hosts: [api],
			} = transaction.wallet().coin().network().toObject();

			try {
				const response = await client.get(`${api.host}/blocks/${transaction.blockId()}`);
				const { data } = response.json();

				setBlockHeight(Numeral.make("en").format(data.height));
			} catch {
				// @TODO: Handle error
			}
		};

		fetchBlockHeight();
	}, []);

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
					<DetailLabelText>{t("COMMON.BLOCK")}</DetailLabelText>
					<Link isExternal to={transaction.explorerLinkForBlock() as string}>
						{blockHeight}
					</Link>
				</div>

				<div className="hidden h-8 w-full items-center sm:flex">
					<Divider dashed />
				</div>

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.NONCE")}</DetailLabelText>
					<div>{data.nonce}</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
