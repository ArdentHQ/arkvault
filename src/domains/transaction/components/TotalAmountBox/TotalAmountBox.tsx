import React from "react";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { assertNumber } from "@/utils/assertions";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";

interface Properties {
	amount: number | string;
	fee: number | string;
	ticker: string;
	convertedAmount?: number;
	convertedFee?: number;
	exchangeTicker?: string;
	convertValues?: boolean;
	hideAmount?: boolean;
}

const ConfirmationTimeFooter = ({ confirmationTime = 10 }: { confirmationTime?: number }) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
			<DetailTitle className="w-auto !leading-4 sm:min-w-36 sm:text-sm">
				{t("COMMON.CONFIRMATION_TIME_LABEL")}
			</DetailTitle>

			<div className="flex flex-row items-center gap-2 lowercase !leading-4 sm:text-sm">
				{t("COMMON.CONFIRMATION_TIME", {
					time: confirmationTime,
				}).toString()}
			</div>
		</div>
	);
};

export const TotalAmountBox = ({
	ticker,
	convertedAmount,
	convertedFee,
	exchangeTicker,
	convertValues,
	hideAmount,
	...properties
}: Properties) => {
	const { t } = useTranslation();

	const amount = +properties.amount;
	const fee = +properties.fee;

	assertNumber(amount);
	assertNumber(fee);

	const total = amount + fee;
	const convertedTotal = convertedAmount && convertedFee ? convertedAmount + convertedFee : undefined;
	return (
		<DetailWrapper
			label={t("COMMON.TRANSACTION_SUMMARY")}
			className="rounded-xl"
			footer={<ConfirmationTimeFooter />}
		>
			<div className="flex flex-col gap-3">
				{!hideAmount && (
					<div
						className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
						data-testid="AmountSection"
					>
						<DetailTitle className="w-auto sm:min-w-36">{t("COMMON.AMOUNT")}</DetailTitle>

						<div className="flex flex-row items-center gap-2">
							<Amount ticker={ticker} value={amount} className="font-semibold" />
							{convertValues && !!convertedAmount && !!exchangeTicker && (
								<div className="font-semibold text-theme-secondary-700">
									(~
									<Amount ticker={exchangeTicker} value={convertedAmount} />)
								</div>
							)}
						</div>
					</div>
				)}

				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-auto sm:min-w-36">{t("COMMON.FEE")}</DetailTitle>

					<div className="flex flex-row items-center gap-2">
						<Amount ticker={ticker} value={fee} className="font-semibold" />
						{convertValues && !!convertedFee && !!exchangeTicker && (
							<div className="font-semibold text-theme-secondary-700">
								(~
								<Amount ticker={exchangeTicker} value={convertedFee} />)
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-auto sm:min-w-36">{t("COMMON.TOTAL")}</DetailTitle>

					<div className="flex flex-row items-center gap-2">
						<Amount ticker={ticker} value={total} className="font-semibold" />
						{convertValues && !!convertedTotal && !!exchangeTicker && (
							<div className="font-semibold text-theme-secondary-700">
								(~
								<Amount ticker={exchangeTicker} value={convertedTotal} />)
							</div>
						)}
					</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
