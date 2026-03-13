import { Contracts } from "@/app/lib/profiles";
import { WalletToken } from "@/app/lib/profiles/wallet-token";

export const useTransferAssets = ({
	profile,
	tokens,
	isSingle,
	isTokenTransfer,
}: {
	isTokenTransfer?: boolean;
	profile: Contracts.IProfile;
	tokens: WalletToken[];
	isSingle?: boolean;
}) => {
	const assetOptions = tokens.map((token) => ({
		label: token.token().displaySymbol(),
		value: token.token().address(),
	}));

	const mainsailAsset = {
		label: profile.activeNetwork().ticker(),
		value: profile.activeNetwork().ticker(),
	};

	const assets = isTokenTransfer ? assetOptions : [mainsailAsset, ...assetOptions];

	return {
		assets: isSingle ? assets : [mainsailAsset],
	};
};
