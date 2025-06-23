import { Contracts, DTO } from "@/app/lib/profiles";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import React, { ReactElement, useMemo } from "react";

import { Amount, AmountLabel } from "@/app/components/Amount";
import { BigNumber } from "@/app/lib/helpers";
import { TransactionAmountLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionAmount.blocks";
import { useTranslation } from "react-i18next";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
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

	const showAmount = useMemo(() => {
		if (transaction.isValidatorRegistration()) {
			return (
				!transaction.isConfirmed() ||
				(transaction.isConfirmed() && "isSuccess" in transaction && transaction.isSuccess())
			);
		}

		return !BigNumber.make(transaction.value()).isZero();
	}, [transaction]);

	return (
		<DetailWrapper label={t("TRANSACTION.SUMMARY")}>
			<div className="space-y-3 sm:space-y-0">
				{showAmount && (
					<>
						<div className="flex w-full justify-between gap-2 sm:justify-start">
							<DetailLabelText className={labelClassName}>
								{transaction.isValidatorRegistration() ? t("COMMON.LOCKED_AMOUNT") : t("COMMON.AMOUNT")}
							</DetailLabelText>

							<TransactionAmountLabel transaction={transaction} profile={profile} />
						</div>

						<DetailDivider />
					</>
				)}

				{transaction.isValidatorResignation() && (senderWallet.validatorFee() ?? 0) > 0 && (
					<>
						<div className="flex w-full justify-between gap-2 sm:justify-start">
							<DetailLabelText className={labelClassName}>{t("COMMON.UNLOCKED_AMOUNT")}</DetailLabelText>

							<AmountLabel
								value={UnitConverter.formatUnits(
									BigNumber.make(senderWallet.validatorFee() ?? 0).toString(),
									"ARK",
								)}
								isNegative={false}
								ticker={transaction.wallet().currency()}
								hideSign={false}
								isCompact
								className="h-[21px] rounded dark:border"
								allowHideBalance
								profile={profile}
							/>
						</div>

						<DetailDivider />
					</>
				)}

				<div className="flex w-full justify-between gap-2 sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.FEE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.currency()}
						value={transaction.fee()}
						className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
						allowHideBalance
						profile={profile}
					/>
				</div>

				<DetailDivider />

				<div className="flex w-full justify-between gap-2 sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.VALUE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.exchangeCurrency()}
						value={transaction.convertedAmount()}
						className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
						allowHideBalance
						profile={profile}
					/>
				</div>
			</div>
		</DetailWrapper>
	);
};
