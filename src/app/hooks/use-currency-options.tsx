import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { OptionGroupProperties } from "@/app/components/SelectDropdown/SelectDropdown.contracts";
import { PlatformSdkChoices } from "@/data";

type UseCurrencyOptionsHook = (marketProvider?: string) => OptionGroupProperties[];

export const useCurrencyOptions: UseCurrencyOptionsHook = (marketProvider) => {
	const { t } = useTranslation();

	return useMemo(() => {
		const allOptions = [
			{ options: PlatformSdkChoices.currencies.fiat, title: t("COMMON.FIAT") },
			{ options: PlatformSdkChoices.currencies.crypto, title: t("COMMON.CRYPTOCURRENCY") },
		];

		const unsupportedCurrencies = PlatformSdkChoices.marketProviders.find(
			(item) => item.value === marketProvider,
		)?.unsupportedCurrencies;

		if (!unsupportedCurrencies?.length) {
			return allOptions;
		}

		return allOptions.map(({ options, ...itemProperties }) => ({
			...itemProperties,
			options: options.filter(({ value }) => !unsupportedCurrencies.includes(`${value}`)),
		}));
	}, [marketProvider, t]);
};
