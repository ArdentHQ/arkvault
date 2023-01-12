export const migrationTransactionFee = () =>
	Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);

export const migrationGuideUrl = () => import.meta.env.VITE_MIGRATION_GUIDE_URL || "https://arkvault.io/docs";

export const metamaskUrl = () => "https://metamask.io/";

export const migrationNetwork = () => import.meta.env.VITE_MIGRATION_NETWORK || "ark.devnet";

export const migrationWalletAddress = () =>
	import.meta.env.VITE_MIGRATION_ADDRESS || "DNBURNBURNBURNBRNBURNBURNBURKz8StY";
