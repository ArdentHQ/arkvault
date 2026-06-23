import { Contracts } from "@/app/lib/profiles";
import { WalletToken } from "@/app/lib/profiles/wallet-token";

export const useTransferAssets = ({
	profile,
	tokens,
	isSingle,
	addedAsset,
}: {
	profile: Contracts.IProfile;
	tokens: WalletToken[];
	isSingle?: boolean;
	addedAsset?: string;
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

	if (!isSingle && addedAsset) {
		return {
			assets:
				addedAsset === "ARK" ? [mainsailAsset] : [assetOptions.find((option) => option.value === addedAsset)],
		};
	}

	return {
		assets: [mainsailAsset, ...assetOptions],
	};
};
