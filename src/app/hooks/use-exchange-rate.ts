import { DateTime } from "@/app/lib/intl";
import { useCallback } from "react";

import { IProfile } from "@/app/lib/profiles/contracts";

interface Input {
	ticker?: string;
	exchangeTicker?: string;
	profile: IProfile;
}

interface Output {
	convert: (value?: number) => number;
}

export const useExchangeRate = ({ profile, ticker, exchangeTicker }: Input): Output => {
	const convert = useCallback(
		(value?: number) => {
			if (!ticker || !exchangeTicker || !value) {
				return 0;
			}

			return profile.exchangeRates().exchange(ticker, exchangeTicker, DateTime.make(), value);
		},
		[exchangeTicker, ticker],
	);

	return { convert };
};
