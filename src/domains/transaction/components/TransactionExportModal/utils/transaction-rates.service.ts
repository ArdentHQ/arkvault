import { Contracts } from "@ardenthq/sdk-profiles";
import { DateTime } from "@ardenthq/sdk-intl";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { HttpClient } from "@/app/services/HttpClient";

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
			limit: from.diffInDays(to),
			toTs: to.toUNIX(),
			tsym: baseCurrency,
		});

		for (const price of response.json().Data) {
			const ymd = DateTime.fromUnix(price.time).format("YYYY-MM-DD");
			rates[baseCurrency].set(ymd, BigNumber.make(price.close).toString());
		}
	};

	const byTimestamp = (timestamp?: DateTime) =>
		rates[baseCurrency].get(DateTime.make(timestamp).format("YYYY-MM-DD"));

	return {
		rate: (timestamp?: DateTime) => byTimestamp(timestamp),
		sync,
	};
};
