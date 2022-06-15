import { renderHook } from "@testing-library/react-hooks";

import { useLocaleCurrency } from "./use-locale-currency";

describe("useLocaleCurrency", () => {
	it("should get currency based on locale", () => {
		jest.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => ({
			resolvedOptions: () => ({
				locale: "de-DE",
			}),
		}));

		const {
			result: { current },
		} = renderHook(() => useLocaleCurrency());

		expect(current.localeCurrency).toBe("EUR");
	});

	it("should fall back to currency based on navigator language", () => {
		jest.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => ({
			resolvedOptions: () => ({
				locale: "en",
			}),
		}));

		jest.spyOn(window.navigator, "language", "get").mockReturnValueOnce("jp-JP");

		const {
			result: { current },
		} = renderHook(() => useLocaleCurrency());

		expect(current.localeCurrency).toBe("JPY");
	});

	it("should fall back to USD", () => {
		jest.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => ({
			resolvedOptions: () => ({
				locale: "xxx",
			}),
		}));

		jest.spyOn(window.navigator, "language", "get").mockReturnValueOnce("xxx");

		const {
			result: { current },
		} = renderHook(() => useLocaleCurrency());

		expect(current.localeCurrency).toBe("USD");
	});

	it("should fall back to USD if currency is not supported", () => {
		jest.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => ({
			resolvedOptions: () => ({
				locale: "vi-VN",
			}),
		}));

		const {
			result: { current },
		} = renderHook(() => useLocaleCurrency());

		expect(current.defaultCurrency).toBe("USD");
	});
});
