import { DateTime } from "@payvo/sdk-intl";
import { useCallback } from "react";

import { useEnvironmentContext } from "@/app/contexts";

interface Input {
	ticker?: string;
	exchangeTicker?: string;
}

interface Output {
	convert: (value?: number) => number;
}

export const useExchangeRate = ({ ticker, exchangeTicker }: Input): Output => {
	const { env } = useEnvironmentContext();

	const convert = useCallback(
		(value?: number) => {
			if (!ticker || !exchangeTicker || !value) {
				return 0;
			}

			return env.exchangeRates().exchange(ticker, exchangeTicker, DateTime.make(), value);
		},
		[env, exchangeTicker, ticker],
	);

	return { convert };
};
