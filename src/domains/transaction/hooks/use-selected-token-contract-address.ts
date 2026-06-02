import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { useMemo } from "react";

export const useSelectedTokenContractAddress = ({
	tokenContractAddress,
	isTokenTransfer,
	tokens,
	ticker,
}: {
	tokenContractAddress?: string;
	isTokenTransfer?: boolean;
	tokens: WalletToken[];
	ticker?: string;
}): string | undefined =>
	useMemo(() => {
		if (tokenContractAddress) {
			return tokenContractAddress;
		}

		if (isTokenTransfer && tokens.length === 0) {
			return ticker;
		}

		return;
	}, [tokenContractAddress, isTokenTransfer, tokens, ticker]);
