import LocaleCurrency from "locale-currency";
import { useMemo } from "react";

export const useLocaleCurrency = () =>
	useMemo(() => {
		let locale = Intl.DateTimeFormat().resolvedOptions().locale;

		if (!locale.includes("-")) {
			locale = navigator.language;
		}

		let currency = LocaleCurrency.getCurrency(locale) as string | null;

		if (!currency) {
			currency = "USD";
		}

		return currency;
	}, []);
