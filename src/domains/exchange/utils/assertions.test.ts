/* eslint-disable unicorn/no-null */
import { httpClient } from "@/app/services";
import { CurrencyData } from "@/domains/exchange/exchange.contracts";
import { ExchangeService } from "@/domains/exchange/services/exchange.service";
import { env, getDefaultProfileId } from "@/utils/testing-library";

import { assertCurrency, assertExchangeService, assertExchangeTransaction } from "./assertions";

describe("#assertExchangeService", () => {
	it("should pass with a ExchangeService instance", () => {
		expect(() => assertExchangeService(new ExchangeService("provider", httpClient))).not.toThrow();
	});

	it("should fail without a ExchangeService instance", () => {
		expect(() => assertExchangeService(undefined)).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received undefined",
		);
		expect(() => assertExchangeService(null)).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received null",
		);
		expect(() => assertExchangeService(true)).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received true",
		);
		expect(() => assertExchangeService(false)).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received false",
		);
		expect(() => assertExchangeService("")).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received ",
		);
		expect(() => assertExchangeService("a")).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received a",
		);
		expect(() => assertExchangeService(1)).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received 1",
		);
		expect(() => assertExchangeService({})).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received [object Object]",
		);
		expect(() => assertExchangeService([])).toThrow(
			"Expected 'exchangeService' to be ExchangeService, but received ",
		);
	});
});

describe("#assertExchangeTransaction", () => {
	it("should pass with a ExchangeTransaction instance", () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "",
				amount: 0,
				ticker: "",
			},
			orderId: "orderId",
			output: {
				address: "",
				amount: 0,
				ticker: "",
			},
			provider: "provider",
		});

		expect(() => assertExchangeTransaction(exchangeTransaction)).not.toThrow();
	});

	it("should fail without a profile instance", () => {
		expect(() => assertExchangeTransaction(undefined)).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received undefined",
		);
		expect(() => assertExchangeTransaction(null)).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received null",
		);
		expect(() => assertExchangeTransaction(true)).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received true",
		);
		expect(() => assertExchangeTransaction(false)).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received false",
		);
		expect(() => assertExchangeTransaction("")).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received ",
		);
		expect(() => assertExchangeTransaction("a")).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received a",
		);
		expect(() => assertExchangeTransaction(1)).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received 1",
		);
		expect(() => assertExchangeTransaction({})).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received [object Object]",
		);
		expect(() => assertExchangeTransaction([])).toThrow(
			"Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received ",
		);
	});
});

describe("#assertCurrency", () => {
	it("should pass with a CurrencyData object", () => {
		const currencyData: CurrencyData = { coin: "ark", name: "ARK" };

		expect(() => assertCurrency(currencyData)).not.toThrow();
	});

	it("should fail without a CurrencyData object", () => {
		expect(() => assertCurrency(undefined)).toThrow(
			"Expected 'currencyData' to be CurrencyData, but received undefined",
		);
		expect(() => assertCurrency(null)).toThrow("Expected 'currencyData' to be CurrencyData, but received null");
		expect(() => assertCurrency(true)).toThrow("Expected 'currencyData' to be CurrencyData, but received true");
		expect(() => assertCurrency(false)).toThrow("Expected 'currencyData' to be CurrencyData, but received false");
		expect(() => assertCurrency("")).toThrow("Expected 'currencyData' to be CurrencyData, but received ");
		expect(() => assertCurrency("a")).toThrow("Expected 'currencyData' to be CurrencyData, but received a");
		expect(() => assertCurrency(1)).toThrow("Expected 'currencyData' to be CurrencyData, but received 1");
		expect(() => assertCurrency({})).toThrow(
			"Expected 'currencyData' to be CurrencyData, but received [object Object]",
		);
		expect(() => assertCurrency([])).toThrow("Expected 'currencyData' to be CurrencyData, but received ");
	});
});
