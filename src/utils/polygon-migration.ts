export const migrationTransactionFee = () =>
	Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);

export const migrationGuideUrl = () => import.meta.env.VITE_MIGRATION_GUIDE_URL || "https://arkvault.io/docs";

export const migrationMinBalance = () => Number.parseFloat(import.meta.env.VITE_MIGRATION_MIN_BALANCE || 1);

export const metamaskUrl = () => "https://metamask.io/";

export const migrationNetwork = () => import.meta.env.VITE_MIGRATION_NETWORK || "ark.devnet";

export const polygonExplorerLink = () => import.meta.env.VITE_POLYGON_EXPLORER_URL || "https://mumbai.polygonscan.com";

export const polygonTransactionLink = (transactionId: string) => `${polygonExplorerLink()}/tx/${transactionId}`;

export const polygonContractAddress = () => import.meta.env.VITE_POLYGON_CONTRACT_ADDRESS;

export const polygonRpcUrl = () => import.meta.env.VITE_POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com/";

export const migrationWalletAddress = () =>
	import.meta.env.VITE_MIGRATION_ADDRESS || "DNBURNBURNBURNBRNBURNBURNBURKz8StY";
