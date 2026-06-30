import { Contracts } from "@/app/lib/profiles";
import { WalletToken } from "@/app/lib/profiles/wallet-token";

export const useTransferAssets = ({
	profile,
	tokens,
	isSingle,
	selectedAsset,
}: {
	profile: Contracts.IProfile;
	tokens: WalletToken[];
	isSingle?: boolean;
	selectedAsset?: string;
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

	if (!isSingle && selectedAsset) {
		const token = assetOptions.find((option) => option.value === selectedAsset)!;

		return {
			assets:
				selectedAsset === "ARK"
					? [mainsailAsset]
					: [token]
		};
	}

	return {
		assets: [mainsailAsset, ...assetOptions],
	};
};
