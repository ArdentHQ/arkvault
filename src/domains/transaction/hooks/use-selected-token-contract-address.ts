import { useMemo } from "react";

export const useSelectedTokenContractAddress = ({
	tokenContractAddress,
	defaultTicker,
	enabled,
}: {
	tokenContractAddress?: string;
	defaultTicker?: string;
	enabled?: boolean;
}): string | undefined =>
	useMemo(() => {
		if (!enabled) {
			return;
		}

		return tokenContractAddress ?? defaultTicker;
	}, [tokenContractAddress, defaultTicker, enabled]);
