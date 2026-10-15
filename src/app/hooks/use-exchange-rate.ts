import { DateTime } from "@ardenthq/sdk-intl";
import { useCallback } from "react";

import { useEnvironmentContext } from "@/app/contexts";

interface Input {
	ticker?: string;
	exchangeTicker?: string;
}

interface Output {
	convert: (value?: number, date?: DateTime) => number;
}

export const useExchangeRate = ({ ticker, exchangeTicker }: Input): Output => {
	const { env } = useEnvironmentContext();

	const convert = useCallback(
		(value?: number, date: DateTime = DateTime.make()) => {
			if (!ticker || !exchangeTicker || !value) {
				return 0;
			}

			return env.exchangeRates().exchange(ticker, exchangeTicker, date, value);
		},
		[env, exchangeTicker, ticker],
	);

	return { convert };
};
