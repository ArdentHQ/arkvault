import { isPreview } from "./test-helpers";

export const migrationTransactionFee = () =>
	Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);

export const migrationGuideUrl = () => import.meta.env.MIGRATION_GUIDE_URL || "https://arkvault.io/docs";

export const metamaskUrl = () => import.meta.env.METAMASK_URL || "https://metamask.io/";

export const migrationNetwork = () => {
	if (isPreview()) {
		return "ark.devnet";
	}

	return "ark.mainnet";
};

export const migrationWalletAddress = () => {
	if (isPreview()) {
		return "DNBURNBURNBURNBRNBURNBURNBURKz8StY";
	}

	// @TBD
	return "DNBURNBURNBURNBRNBURNBURNBURKz8StY";
};
