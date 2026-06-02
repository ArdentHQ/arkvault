import { useMemo } from "react";

export const useSelectedTokenContractAddress = ({
	tokenContractAddress,
	isTokenTransfer,
	tokens,
	ticker,
}: {
	tokenContractAddress?: string;
	isTokenTransfer?: boolean;
	tokens: unknown[];
	ticker?: string;
}): string | undefined => {
	return useMemo(() => {
		if (tokenContractAddress) {
			return tokenContractAddress;
		}

		if (isTokenTransfer && tokens.length === 0) {
			return ticker;
		}

		return undefined;
	}, [tokenContractAddress, isTokenTransfer, tokens, ticker]);
};
