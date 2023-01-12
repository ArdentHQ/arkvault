import { isPreview } from "./test-helpers";

export const migrationTransactionFee = () => {
	return Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);
};

export const migrationGuideUrl = () => {
	return import.meta.env.MIGRATION_GUIDE_URL || "https://arkvault.io/docs";
};

export const metamaskUrl = () => {
	return import.meta.env.METAMASK_URL || "https://metamask.io/";
};

export const migrationNetwork = () => {
	if (isPreview()) {
		return import.meta.env.MIGRATION_DEVNET_NETWORK || "ark.devnet";
	}

	return import.meta.env.MIGRATION_MAINNET_NETWORK || "ark.mainnet";
};

export const migrationWalletAddress = () => {
	if (isPreview()) {
		return import.meta.env.MIGRATION_DEVNET_ADDRESS || "DNBURNBURNBURNBRNBURNBURNBURKz8StY";
	}

	// @TBD
	return import.meta.env.MIGRATION_MAINNET_ADDRESS;
};
