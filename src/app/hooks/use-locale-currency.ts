import LocaleCurrency from "locale-currency";
import { useMemo } from "react";
import { useCurrencyOptions } from "@/app/hooks/use-currency-options";
import { DEFAULT_MARKET_PROVIDER } from "@/domains/profile/data";

export const useLocaleCurrency = () => {
	const currencyOptions = useCurrencyOptions(DEFAULT_MARKET_PROVIDER);

	const localeCurrency = useMemo(() => {
		let locale = Intl.DateTimeFormat().resolvedOptions().locale;

		if (!locale.includes("-")) {
			locale = navigator.language;
		}

		let currency = LocaleCurrency.getCurrency(locale);

		if (!currency) {
			currency = "USD";
		}

		return currency;
	}, []);

	const defaultCurrency = useMemo(() => {
		const [fiatOptions] = currencyOptions;

		if (fiatOptions.options.some((option) => `${option.value}`.toLowerCase() === localeCurrency.toLowerCase())) {
			return localeCurrency;
		}

		return "USD";
	}, [currencyOptions, localeCurrency]);

	return { defaultCurrency, localeCurrency };
};
