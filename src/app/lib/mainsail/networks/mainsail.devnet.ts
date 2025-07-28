import { explorer, featureFlags, importMethods, transactions } from "./shared";

import { Networks } from "@/app/lib/mainsail";

const network: Networks.NetworkManifest = {
	coin: "Mainsail",
	constants: {
		epoch: "2023-12-21T00:00:00.000Z",
		slip44: 111,
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
			host: "https://testnet.mainsailhq.com/api",
			type: "full",
		},
		{
			host: "https://testnet.mainsailhq.com/tx/api",
			type: "tx",
		},
		{
			host: "https://explorer-demo.mainsailhq.com",
			type: "explorer",
		},
		{
			host: "https://testnet.mainsailhq.com/rpc/api",
			type: "evm",
		},
	],
	id: "mainsail.devnet",
	importMethods,
	knownWallets:
		"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainsail/devnet/known-wallets-extended.json",
	meta: {
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
