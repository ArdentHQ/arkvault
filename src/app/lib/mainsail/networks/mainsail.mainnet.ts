import { explorer, featureFlags, importMethods, transactions } from "./shared.js";

import { Networks } from "@/app/lib/mainsail";

const network: Networks.NetworkManifest = {
	coin: "Mainsail",
	constants: {
		epoch: "2017-03-21T13:00:00.000Z",
		slip44: 111,
		slip44Eth: 60,
		slip44Legacy: 1,
	},
	currency: {
		decimals: 18,
		symbol: "Ѧ",
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
	id: "mainsail.mainnet",
	importMethods,
	knownWallets: "https://raw.githubusercontent.com/ArkEcosystem/common/master/mainnet/known-wallets-extended.json",
	meta: {
		fastDelegateSync: true,
		nethash: "3da160779cc52343e6f5923062986b775baa5abbd831f9f9b46308280924490f",
	},
	name: "Mainnet",
	transactions,
	type: "live",
};

export default network;
