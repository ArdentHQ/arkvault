import React from "react";
import { useTranslation } from "react-i18next";
import tw from "twin.macro";

import { Amount } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { assertNumber } from "@/utils/assertions";

interface Properties {
	amount: number | string;
	fee: number | string;
	ticker: string;
	amountLabel?: string;
	totalAmountLabel?: string;
	shouldSubtract?: boolean;
}

const AmountLabel = tw.span`text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700`;

export const TotalAmountBox = ({
	ticker,
	amountLabel,
	totalAmountLabel,
	shouldSubtract,
	...properties
}: Properties) => {
	const { t } = useTranslation();

	const amount = +properties.amount;
	const fee = +properties.fee;

	assertNumber(amount);
	assertNumber(fee);

	const total = shouldSubtract ? amount - fee : amount + fee;

	return (
		<div className="rounded-lg border border-theme-secondary-300 dark:border-theme-secondary-800">
			<div className="relative p-4">
				<div className="flex flex-col divide-y divide-theme-secondary-300 dark:divide-theme-secondary-800 sm:flex-row sm:divide-y-0 sm:divide-x">
					<div className="mb-4 flex flex-col justify-center py-2 px-4 text-center sm:mb-0 sm:w-1/2 sm:text-left">
						<AmountLabel>{t("TRANSACTION.TRANSACTION_AMOUNT")}</AmountLabel>
						<Amount className="text-md mt-1 font-semibold" ticker={ticker} value={amount} />
					</div>

					<div className="flex flex-col justify-center p-2 px-4 pt-6 text-center sm:w-1/2 sm:pt-2 sm:text-right">
						<AmountLabel>{amountLabel || t("TRANSACTION.TRANSACTION_FEE")}</AmountLabel>
						<Amount ticker={ticker} value={fee} className="text-md mt-1 font-semibold" />
					</div>
				</div>

				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
					<div className="ml-px bg-theme-background p-2 text-theme-secondary-900 dark:text-theme-secondary-600">
						<Icon name={shouldSubtract ? "Minus" : "Plus"} />
					</div>
				</div>
			</div>

			<div className="justfiy-center flex flex-col items-center rounded-b-lg border-t border-theme-secondary-300 bg-theme-secondary-100 py-6 dark:border-theme-secondary-800 dark:bg-theme-secondary-800">
				<AmountLabel>{totalAmountLabel || t("TRANSACTION.TOTAL_AMOUNT")}</AmountLabel>
				<Amount ticker={ticker} value={total} className="text-md font-bold sm:text-lg" />
			</div>
		</div>
	);
};
