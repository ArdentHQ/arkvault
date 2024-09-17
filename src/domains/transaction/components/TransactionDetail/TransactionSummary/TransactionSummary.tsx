import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { Divider } from "@/app/components/Divider";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Amount, AmountLabel } from "@/app/components/Amount";
import { BigNumber } from "@ardenthq/sdk-helpers";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
}

export const TransactionSummary = ({ transaction, senderWallet }: Properties): ReactElement => {
	const { t } = useTranslation();

	return (
		<DetailWrapper label={t("TRANSACTION.SUMMARY")}>
			<div className="space-y-3 sm:space-y-0">
				{!BigNumber.make(transaction.amount()).isZero() && (
					<>
						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText>{t("COMMON.AMOUNT")}</DetailLabelText>
							<AmountLabel
								isNegative={transaction.isSent()}
								value={transaction.amount()}
								ticker={senderWallet.currency()}
							/>
						</div>

						<div className="hidden h-8 w-full items-center sm:flex">
							<Divider dashed />
						</div>
					</>
				)
				}

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.FEE")}</DetailLabelText>
					<Amount ticker={senderWallet.currency()} value={transaction.fee()} />
				</div>

				<div className="hidden h-8 w-full items-center sm:flex">
					<Divider dashed />
				</div>

				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText>{t("COMMON.VALUE")}</DetailLabelText>
					<Amount ticker={senderWallet.exchangeCurrency()} value={transaction.convertedAmount()} />
				</div>
			</div>
		</DetailWrapper>
	);
};
