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
		} = renderHook(() => useCurrencyOptions("arkpricing"), { wrapper: WithProviders });

		const fiatValues = currencyOptions[0].options.map((option) => option.value);

		expect(fiatValues).toHaveLength(PlatformSdkChoices.currencies.fiat.length - 8);
		expect(fiatValues).not.toContain("MXN");
		expect(fiatValues).not.toContain("VND");
		expect(currencyOptions[1].options).toHaveLength(PlatformSdkChoices.currencies.crypto.length);
	});

	it("returns all currencies if the market provider supports every currency", () => {
		const {
			result: { current: currencyOptions },
		} = renderHook(() => useCurrencyOptions("coingecko"), { wrapper: WithProviders });

		expect(currencyOptions[0].options).toHaveLength(PlatformSdkChoices.currencies.fiat.length);
	});
});
