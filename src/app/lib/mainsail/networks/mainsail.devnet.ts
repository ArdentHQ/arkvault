import { explorer, featureFlags, importMethods, transactions } from "./shared";

import { Networks } from "@/app/lib/sdk";

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
		delegateCount: 53,
		votesPerTransaction: 1,
		votesPerWallet: 1,
	},
	hosts: [
		{
			host: "http://0.0.0.0:4003/api",
			type: "full",
		},
		{
			host: "http://0.0.0.0:4007/api",
			type: "tx",
		},
		{
			host: "http://0.0.0.0:4008/api",
			type: "explorer",
		},
		{
			host: "https://dwallets-evm.mainsailhq.com/evm/api",
			type: "evm",
		},
	],
	id: "mainsail.devnet",
	importMethods,
	knownWallets:
		"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainsail/devnet/known-wallets-extendedon",
	meta: {
		chainId: 10_000,
		// fastDelegateSync: true,
		nethash: "c481dea3dcc13708364e576dff94dd499692b56cbc646d5acd22a3902297dd51",
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
