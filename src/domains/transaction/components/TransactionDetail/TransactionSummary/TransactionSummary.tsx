import { Contracts, DTO } from "@/app/lib/profiles";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import React, { ReactElement, useMemo } from "react";

import { Amount, AmountLabel } from "@/app/components/Amount";
import { BigNumber } from "@/app/lib/helpers";
import { TransactionAmountLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionAmount.blocks";
import { useTranslation } from "react-i18next";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { Tooltip } from "@/app/components/Tooltip";
import { Icon } from "@/app/components/Icon";
interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	labelClassName?: string;
	profile?: Contracts.IProfile;
	allowHideBalance?: boolean;
}
export const TransactionSummary = ({
	transaction,
	senderWallet,
	labelClassName,
	profile,
	allowHideBalance = false,
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

	const validatorFee = senderWallet.validatorFee() ?? 0;

	return (
		<DetailWrapper label={t("TRANSACTION.SUMMARY")}>
			<div className="space-y-3">
				{showAmount && (
					<div
						data-testid="TransactionSummary__Amount"
						className="flex gap-2 justify-between w-full sm:justify-start"
					>
						<DetailLabelText className={labelClassName}>
							{transaction.isValidatorRegistration() ? t("COMMON.LOCKED_AMOUNT") : t("COMMON.AMOUNT")}
						</DetailLabelText>

						<TransactionAmountLabel transaction={transaction} profile={profile} allowHideBalance={allowHideBalance} />
					</div>
				)}

				{transaction.isValidatorResignation() && (
					<div
						data-testid="TransactionSummary__ValidatorFee"
						className="flex gap-2 justify-between w-full sm:justify-start"
					>
						<DetailLabelText className={labelClassName}>{t("COMMON.UNLOCKED_AMOUNT")}</DetailLabelText>

						<AmountLabel
							value={UnitConverter.formatUnits(BigNumber.make(validatorFee).toString(), "ARK")}
							isNegative={false}
							ticker={transaction.wallet().currency()}
							hideSign={false}
							isCompact
							className="h-[21px] rounded dark:border"
							allowHideBalance={allowHideBalance}
							profile={profile}
						/>

						{BigNumber.make(validatorFee).isZero() && (
							<Tooltip content={t("TRANSACTION.VALIDATOR_REGISTERED_WITHOUT_FEE")}>
								<div
									data-testid="TransactionSummary__ValidatorFee__Tooltip"
									className="flex justify-center items-center w-5 h-5 rounded-full bg-theme-primary-100 dark:bg-theme-dark-800 dark:text-theme-dark-50 text-theme-primary-600"
								>
									<Icon name="QuestionMarkSmall" size="sm" />
								</div>
							</Tooltip>
						)}
					</div>
				)}

				<div className="flex gap-2 justify-between w-full sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.FEE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.currency()}
						value={transaction.fee()}
						className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
						allowHideBalance={allowHideBalance}
						profile={profile}
					/>
				</div>

				<div className="flex gap-2 justify-between w-full sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.VALUE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.exchangeCurrency()}
						value={transaction.convertedAmount()}
						className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
						allowHideBalance={allowHideBalance}
						profile={profile}
					/>
				</div>
			</div>
		</DetailWrapper>
	);
};
