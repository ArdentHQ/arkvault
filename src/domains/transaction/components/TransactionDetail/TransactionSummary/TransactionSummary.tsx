import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Amount } from "@/app/components/Amount";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { TransactionAmountLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionAmount.blocks";

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
						<div className="flex w-full items-center justify-between sm:justify-start">
							<DetailLabelText className={labelClassName}>{t("COMMON.AMOUNT")}</DetailLabelText>
							<TransactionAmountLabel
								transaction={transaction}
								textClassName="text-base"
								className="h-auto"
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
						className="text-sm font-semibold leading-[17px] sm:text-base sm:leading-5"
					/>
				</div>

				<DetailDivider />

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.VALUE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.exchangeCurrency()}
						value={transaction.convertedAmount()}
						className="text-sm font-semibold leading-[17px] sm:text-base sm:leading-5"
					/>
				</div>
			</div>
		</DetailWrapper>
	);
};
