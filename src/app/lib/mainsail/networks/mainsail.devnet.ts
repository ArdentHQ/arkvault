import { explorer, featureFlags, importMethods, transactions } from "./shared";

import { Networks } from "@/app/lib/mainsail";

const network: Networks.NetworkManifest = {
	coin: "Mainsail",
	constants: {
		epoch: "2023-12-21T00:00:00.000Z",
		slip44: 60,
	},
	currency: {
		decimals: 18,
		symbol: "TѦ",
		ticker: "ARK",
	},
	explorer,
	featureFlags,
	governance: {
		validatorCount: 53,
		votesPerTransaction: 1,
		votesPerWallet: 1,
	},
	hosts: [
		{
			host: import.meta.env.VITE_MAINSAIL_DEVNET_FULL_HOST || "https://testnet.mainsailhq.com/api",
			type: "full",
		},
		{
			host: import.meta.env.VITE_MAINSAIL_DEVNET_TX_HOST || "https://testnet.mainsailhq.com/tx/api",
			type: "tx",
		},
		{
			host: import.meta.env.VITE_MAINSAIL_DEVNET_EXPLORER_HOST || "https://explorer-demo.mainsailhq.com",
			type: "explorer",
		},
		{
			host: import.meta.env.VITE_MAINSAIL_DEVNET_EVM_HOST || "https://testnet.mainsailhq.com/rpc/api",
			type: "evm",
		},
	],
	id: "mainsail.devnet",
	importMethods,
	knownWallets:
		"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainsail/devnet/known-wallets-extended.json",
	meta: {
		ark_slip44: 111, // Reference to old ark slip44 for migration.
		chainId: 11812,
		nethash: "560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114",
		slip44: 111,
		wif: 186,
	},
	name: "Devnet",
	transactions: {
		...transactions,
		fees: {
			ticker: "ARK",
			type: "dynamic",
		},
		multiPaymentRecipients: 128,
	},
	type: "test",
};

export default network;
