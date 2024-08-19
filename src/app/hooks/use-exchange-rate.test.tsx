import { renderHook, RenderHookResult } from "@testing-library/react";
import React from "react";

import { useExchangeRate } from "./use-exchange-rate";
import { env, WithProviders } from "@/utils/testing-library";

describe("useExchangeRate", () => {
	const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

	const renderExchangeRate = () =>
		renderHook(
			() =>
				useExchangeRate({
					exchangeTicker: "USD",
					ticker: "ARK",
				}),
			{
				wrapper,
			},
		);

	it("should return a function to convert values based on exchange rates", () => {
		vi.spyOn(env.exchangeRates(), "exchange").mockReturnValueOnce(1);

		const { result } = renderExchangeRate();

		expect(typeof result.current.convert).toBe("function");

		const converted = result.current.convert(1);

		expect(converted).toBe(1);
	});

	it("should default to 0 when ticker or exchangeTicker are not provided", () => {
		let hook: RenderHookResult<any, any>;

		hook = renderHook(
			() =>
				useExchangeRate({
					exchangeTicker: "USD",
				}),
			{
				wrapper,
			},
		);

		expect(hook.result.current.convert(1)).toBe(0);

		hook = renderHook(
			() =>
				useExchangeRate({
					ticker: "ARK",
				}),
			{
				wrapper,
			},
		);

		expect(hook.result.current.convert(1)).toBe(0);
	});

	it("should return 0 when value is undefined", () => {
		const {
			result: { current },
		} = renderExchangeRate();

		expect(current.convert(undefined)).toBe(0);
	});
});
