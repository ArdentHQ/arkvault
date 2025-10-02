import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Circle } from "@/app/components/Circle";
import { Skeleton } from "@/app/components/Skeleton";
import { CurrencyData } from "@/domains/exchange/exchange.contracts";

interface CurrencyIconProperties {
	image?: string;
	ticker?: string;
}

const CurrencyIcon = ({ image, ticker }: CurrencyIconProperties) => {
	if (!image) {
		return (
			<Circle
				size="sm"
				className="border-theme-secondary-200 bg-theme-secondary-200 ring-theme-background dark:border-theme-secondary-700 dark:bg-theme-secondary-700 dim:bg-theme-dim-800 dim:border-theme-dim-800"
				noShadow
			/>
		);
	}

	return (
		<div className="flex h-8 w-8 items-center justify-center">
			<img src={image} alt={`${ticker?.toUpperCase()} Icon`} className="h-full w-full" />
		</div>
	);
};

interface FormDividerProperties {
	isLoading: boolean;
	exchangeRate: number;
	fromCurrency: CurrencyData;
	toCurrency: CurrencyData;
}

const FormDivider = ({ isLoading, exchangeRate, fromCurrency, toCurrency }: FormDividerProperties) => {
	const { t } = useTranslation();

	const hasRate = useMemo(
		() => !!(exchangeRate && fromCurrency && toCurrency),
		[exchangeRate, fromCurrency, toCurrency],
	);

	const renderExchangeRate = () => {
		if (isLoading) {
			return (
				<span className="inline-flex h-[13px] items-center">
					<Skeleton width={200} height={13} />
				</span>
			);
		}

		if (hasRate) {
			return (
				<span data-testid="FormDivider__exchange-rate">
					1 {fromCurrency.coin.toUpperCase()} ≈{" "}
					<Amount value={exchangeRate} ticker={toCurrency.coin.toUpperCase()} />
				</span>
			);
		}

		return <span>{t("COMMON.NOT_AVAILABLE")}</span>;
	};

	return (
		<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 z-0 -mt-1 mb-4 rounded-b px-4 pt-4 pb-3 text-xs leading-[15px] font-semibold">
			<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200">
				{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_RATE")}:
			</span>
			<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 ml-2">
				{renderExchangeRate()}
			</span>
		</div>
	);
};

export { CurrencyIcon, FormDivider };
