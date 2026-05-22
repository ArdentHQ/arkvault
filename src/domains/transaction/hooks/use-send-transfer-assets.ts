import { Contracts } from "@/app/lib/profiles";
import { WalletToken } from "@/app/lib/profiles/wallet-token";

export const useTransferAssets = ({
	profile,
	tokens,
	isSingle,
}: {
	profile: Contracts.IProfile;
	tokens: WalletToken[];
	isSingle?: boolean;
}) => {
	const assetOptions = tokens.map((token) => ({
		data: token,
		label: token.token().displaySymbol(),
		value: token.token().address(),
	}));

	const mainsailAsset = {
		data: undefined,
		label: profile.activeNetwork().ticker(),
		value: profile.activeNetwork().ticker(),
	};

	return {
		assets: isSingle ? [mainsailAsset, ...assetOptions] : [mainsailAsset],
	};
};
