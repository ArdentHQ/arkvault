import { WalletToken } from "@/app/lib/profiles/wallet-token";

export const useSelectedTokenContractAddress = ({
	tokenContractAddress,
	defaultTicker,
}: {
	tokenContractAddress?: string;
	tokens: WalletToken[];
	defaultTicker?: string;
}): string | undefined => {
	if (tokenContractAddress) {
		return tokenContractAddress;
	}

	return defaultTicker;
};
