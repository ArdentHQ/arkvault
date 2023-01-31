import { ethers } from "ethers";
import { DTO } from "@ardenthq/sdk-profiles";
import { AddEthereumChainParameter } from "@/domains/migration/hooks/use-meta-mask.contracts";

export const migrationTransactionFee = () =>
	Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);

export const migrationGuideUrl = () =>
	import.meta.env.VITE_MIGRATION_GUIDE_URL || "https://ark.dev/docs/core/migration/devnet";

export const migrationLearnMoreUrl = () =>
	import.meta.env.VITE_MIGRATION_LEARN_MORE_URL || "https://arkscic.com/blog/ark-is-moving-to-polygon";

export const migrationMinBalance = () => Number.parseFloat(import.meta.env.VITE_MIGRATION_MIN_BALANCE || 1);

export const metamaskUrl = () => "https://metamask.io/";

export const migrationNetwork = () => import.meta.env.VITE_MIGRATION_NETWORK || "ark.devnet";

export const polygonExplorerLink = () => import.meta.env.VITE_POLYGON_EXPLORER_URL || "https://mumbai.polygonscan.com";

export const polygonTransactionLink = (transactionId: string) => `${polygonExplorerLink()}/tx/${transactionId}`;

export const polygonContractAddress = () => import.meta.env.VITE_POLYGON_CONTRACT_ADDRESS;

export const polygonRpcUrl = () => import.meta.env.VITE_POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com/";

export const polygonIndexerUrl = () => import.meta.env.VITE_POLYGON_INDEXER_URL;

export const polygonMigrationStartTime = () => Number.parseInt(import.meta.env.VITE_POLYGON_MIGRATION_START_TIME || 0);

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

export const isValidMigrationTransaction = (
	transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData,
) => {
	const polygonAddress = transaction.memo();

	if (!polygonAddress) {
		return false;
	}

	if (transaction.recipient() !== migrationWalletAddress()) {
		return false;
	}

	if (!ethers.utils.isAddress(polygonAddress)) {
		return false;
	}

	if (transaction.amount() < migrationMinBalance()) {
		return false;
	}

	if (transaction.fee() < migrationTransactionFee()) {
		return false;
	}

	return true;
};
