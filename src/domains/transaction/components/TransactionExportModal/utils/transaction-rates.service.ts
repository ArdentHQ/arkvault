import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { HttpClient } from "@/app/services/HttpClient";
import { DateTime } from "@ardenthq/sdk-intl";
import { BigNumber } from "@ardenthq/sdk-helpers";

export const TransactionRates = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const exchangeEndpoint = "https://min-api.cryptocompare.com/data/histoday";
	const client = new HttpClient(0);
	const baseCurrency = "USD";

	const rates = {
		[baseCurrency]: new Map(),
	};

	const sync = async ({ from = DateTime.make(), to }: { from?: DateTime; to: DateTime }) => {
		const response = await client.get(exchangeEndpoint, {
			fsym: wallet.network().ticker(),
			tsym: baseCurrency,
			toTs: to.toUNIX(),
			limit: from.diffInDays(to),
		});

		for (const price of response.json().Data) {
			const ymd = DateTime.fromUnix(price.time).format("YYYY-MM-DD");
			rates[baseCurrency].set(ymd, BigNumber.make(price.close).toString());
		}
	};

	const byTimestamp = (timestamp?: DateTime) => {
		return rates[baseCurrency].get(DateTime.make(timestamp).format("YYYY-MM-DD"));
	};

	return {
		sync,
		rate: (timestamp?: DateTime) => byTimestamp(timestamp),
	};
};
