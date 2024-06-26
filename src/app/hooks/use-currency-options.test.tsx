import { renderHook } from "@testing-library/react";

import { useCurrencyOptions } from "./use-currency-options";
import { PlatformSdkChoices } from "@/data";
import { WithProviders } from "@/utils/testing-library";

describe("useCurrencyOptions", () => {
	it("returns all currency options if no market provider is specified", () => {
		const {
			result: { current: currencyOptions },
		} = renderHook(() => useCurrencyOptions(), { wrapper: WithProviders });

		expect(currencyOptions).toHaveLength(2);
		// Fiat
		expect(currencyOptions[0].options).toHaveLength(PlatformSdkChoices.currencies.fiat.length);
		// Crypto
		expect(currencyOptions[1].options).toHaveLength(PlatformSdkChoices.currencies.crypto.length);
	});

	it("returns only supported currencies if market provider is specified and has unsupported currencies", () => {
		const {
			result: { current: currencyOptions },
		} = renderHook(() => useCurrencyOptions("cryptocompare"), { wrapper: WithProviders });

		expect(currencyOptions[0].options.map((option) => option.value)).not.toContain("VND");
	});
});
