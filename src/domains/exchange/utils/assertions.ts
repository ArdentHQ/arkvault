import { AssertionError } from "assert";
import { Contracts } from "@ardenthq/sdk-profiles";

import { CurrencyData } from "@/domains/exchange/exchange.contracts";
import { ExchangeService } from "@/domains/exchange/services/exchange.service";

export function assertExchangeService(exchangeService?: ExchangeService): asserts exchangeService is ExchangeService {
	if (!(exchangeService instanceof ExchangeService)) {
		throw new AssertionError({
			message: `Expected 'exchangeService' to be ExchangeService, but received ${exchangeService}`,
		});
	}
}

export function assertExchangeTransaction(
	exchangeTransaction?: Contracts.IExchangeTransaction,
): asserts exchangeTransaction is Contracts.IExchangeTransaction {
	if (typeof exchangeTransaction?.orderId !== "function") {
		throw new AssertionError({
			message: `Expected 'exchangeTransaction' to be Contracts.IExchangeTransaction, but received ${exchangeTransaction}`,
		});
	}
}

export function assertCurrency(currencyData?: CurrencyData): asserts currencyData is CurrencyData {
	if (!currencyData || typeof currencyData !== "object" || !("coin" in currencyData && "name" in currencyData)) {
		throw new AssertionError({
			message: `Expected 'currencyData' to be CurrencyData, but received ${currencyData}`,
		});
	}
}
