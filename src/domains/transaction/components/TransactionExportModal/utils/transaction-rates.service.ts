import { Contracts } from "@ardenthq/sdk-profiles";
import { DateTime } from "@ardenthq/sdk-intl";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { HttpClient } from "@/app/services/HttpClient";

// TODO: Handle this from sdk.
export const TransactionRates = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const exchangeEndpoint = "https://min-api.cryptocompare.com/data/histoday";
	const client = new HttpClient(0);
	const exchangeCurrency = wallet.exchangeCurrency();

	const rates = {
		[exchangeCurrency]: new Map(),
	};

	const sync = async ({ from = DateTime.make(), to }: { from?: DateTime; to: DateTime }) => {
		const response = await client.get(exchangeEndpoint, {
			fsym: wallet.network().ticker(),
			tsym: exchangeCurrency,
			toTs: to.toUNIX() * 1000,
			limit: from.diffInDays(to),
		});

		for (const price of response.json().Data) {
			const ymd = DateTime.fromUnix(price.time).format("YYYY-MM-DD");
			rates[exchangeCurrency].set(ymd, BigNumber.make(price.close));
		}
	};

	const byDay = (timestamp?: DateTime) => rates[exchangeCurrency].get(timestamp?.format("YYYY-MM-DD"));

	return {
		sync,
		byDay,
	};
};
