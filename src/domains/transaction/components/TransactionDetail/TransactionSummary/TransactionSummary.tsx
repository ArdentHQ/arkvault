import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Amount, AmountLabel } from "@/app/components/Amount";
import { BigNumber } from "@ardenthq/sdk-helpers";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	labelClassName?: string;
}
export const TransactionSummary = ({ transaction, senderWallet, labelClassName }: Properties): ReactElement => {
	const { t } = useTranslation();

	return (
		<DetailWrapper label={t("TRANSACTION.SUMMARY")}>
			<div className="space-y-3 sm:space-y-0">
				{!BigNumber.make(transaction.amount()).isZero() && (
					<>
						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText className={labelClassName}>{t("COMMON.AMOUNT")}</DetailLabelText>
							<AmountLabel
								isNegative={transaction.isSent()}
								value={transaction.amount()}
								ticker={senderWallet.currency()}
								className="leading-5"
							/>
						</div>

						<DetailDivider />
					</>
				)}

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.FEE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.currency()}
						value={transaction.fee()}
						className="font-semibold leading-5"
					/>
				</div>

				<DetailDivider />

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.VALUE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.exchangeCurrency()}
						value={transaction.convertedAmount()}
						className="font-semibold leading-5"
					/>
				</div>
			</div>
		</DetailWrapper>
	);
};
