/* eslint-disable @typescript-eslint/require-await */
import { renderHook } from "@testing-library/react-hooks";
import React from "react";

import { useLocaleCurrency } from "./use-locale-currency";

describe("useLocaleCurrency", () => {
	it("should get currency based on locale", async () => {
		jest.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => ({
			resolvedOptions: () => ({
				locale: "de-DE",
			}),
		}));

		const {
			result: { current },
		} = renderHook(() => useLocaleCurrency());

		expect(current).toEqual("EUR");
	});

	it("should fall back to currency based on navigator language", async () => {
		jest.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => ({
			resolvedOptions: () => ({
				locale: "en",
			}),
		}));

		jest.spyOn(window.navigator, "language", "get").mockReturnValueOnce("jp-JP");

		const {
			result: { current },
		} = renderHook(() => useLocaleCurrency());

		expect(current).toEqual("JPY");
	});

	it("should fall back to USD", async () => {
		jest.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => ({
			resolvedOptions: () => ({
				locale: "xxx",
			}),
		}));

		jest.spyOn(window.navigator, "language", "get").mockReturnValueOnce("xxx");

		const {
			result: { current },
		} = renderHook(() => useLocaleCurrency());

		expect(current).toEqual("USD");
	});
});
