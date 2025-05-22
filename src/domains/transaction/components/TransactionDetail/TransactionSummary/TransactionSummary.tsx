import { Contracts, DTO } from "@/app/lib/profiles";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import React, { ReactElement } from "react";

import { Amount } from "@/app/components/Amount";
import { BigNumber } from "@/app/lib/helpers";
import { TransactionAmountLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionAmount.blocks";
import { useTranslation } from "react-i18next";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	labelClassName?: string;
	profile?: Contracts.IProfile;
}
export const TransactionSummary = ({
	transaction,
	senderWallet,
	labelClassName,
	profile,
}: Properties): ReactElement => {
	const { t } = useTranslation();

	return (
		<DetailWrapper label={t("TRANSACTION.SUMMARY")}>
			<div className="space-y-3 sm:space-y-0">
				{!BigNumber.make(transaction.value()).isZero() && (
					<>
						<div className="flex justify-between w-full sm:justify-start">
							<DetailLabelText className={labelClassName}>{t("COMMON.AMOUNT")}</DetailLabelText>
							<TransactionAmountLabel transaction={transaction} profile={profile} />
						</div>

						<DetailDivider />
					</>
				)}

				<div className="flex justify-between w-full sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.FEE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.currency()}
						value={transaction.fee()}
						className="text-sm font-semibold sm:text-base sm:leading-5 leading-[17px]"
						allowHideBalance
						profile={profile}
					/>
				</div>

				<DetailDivider />

				<div className="flex justify-between w-full sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.VALUE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.exchangeCurrency()}
						value={transaction.convertedAmount()}
						className="text-sm font-semibold sm:text-base sm:leading-5 leading-[17px]"
						allowHideBalance
						profile={profile}
					/>
				</div>
			</div>
		</DetailWrapper>
	);
};
