import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
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
				className="border-theme-secondary-200 bg-theme-secondary-200 ring-theme-background dark:border-theme-secondary-700 dark:bg-theme-secondary-700"
				noShadow
			/>
		);
	}

	return (
		<div className="flex justify-center items-center w-8 h-8">
			<img src={image} alt={`${ticker?.toUpperCase()} Icon`} className="w-full h-full" />
		</div>
	);
};

interface FormDividerProperties {
	isLoading: boolean;
	exchangeRate: number;
	fromCurrency: CurrencyData;
	toCurrency: CurrencyData;
	onSwapCurrencies: () => void;
}

const FormDivider = ({
	isLoading,
	exchangeRate,
	fromCurrency,
	toCurrency,
	onSwapCurrencies,
}: FormDividerProperties) => {
	const { t } = useTranslation();

	const hasRate = useMemo(
		() => !!(exchangeRate && fromCurrency && toCurrency),
		[exchangeRate, fromCurrency, toCurrency],
	);

	const renderExchangeRate = () => {
		if (isLoading) {
			return (
				<div className="flex items-center h-5">
					<Skeleton width={200} height={14} />
				</div>
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
		<div className="flex space-x-4 sm:ml-8 sm:space-x-8">
			<div className="relative my-1 h-20 border-l border-theme-secondary-300 dark:border-theme-secondary-800">
				<div className="absolute top-1/2 w-2 h-2 rounded-full border -translate-x-1/2 -translate-y-1/2 border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800" />
			</div>

			<div className="flex flex-1 items-center">
				<div className="flex flex-col space-y-2 text-sm sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
					<span className="mt-px mr-auto font-semibold border-b border-dashed border-theme-primary-600 text-theme-primary-600">
						{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_RATE")}:
					</span>
					{renderExchangeRate()}
				</div>

				<Button
					data-testid="ExchangeForm__swap-button"
					className="ml-auto"
					size="icon"
					variant="secondary"
					icon="ArrowDownUp"
					disabled={!fromCurrency && !toCurrency}
					onClick={onSwapCurrencies}
				/>
			</div>
		</div>
	);
};

export { CurrencyIcon, FormDivider };
