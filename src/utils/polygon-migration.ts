import { AddEthereumChainParameter } from "@/domains/migration/hooks/use-meta-mask.contracts";

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

export const polygonIndexerUrl = () => import.meta.env.VITE_POLYGON_INDEXER_URL;

export const migrationWalletAddress = () =>
	import.meta.env.VITE_MIGRATION_ADDRESS || "DNBURNBURNBURNBRNBURNBURNBURKz8StY";

export const polygonNetworkData = (): AddEthereumChainParameter => {
	if (migrationNetwork() === "ark.devnet") {
		return {
			blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
			chainId: "0x13881",
			chainName: "Mumbai",
			nativeCurrency: {
				decimals: 18,
				name: "MATIC",
				symbol: "MATIC",
			},
			rpcUrls: ["https://matic-mumbai.chainstacklabs.com/"],
		};
	}

	return {
		blockExplorerUrls: ["https://polygonscan.com/"],
		chainId: "0x89",
		chainName: "Polygon Mainnet",
		nativeCurrency: {
			decimals: 18,
			name: "MATIC",
			symbol: "MATIC",
		},
		rpcUrls: ["https://polygon-rpc.com/"],
	};
};
