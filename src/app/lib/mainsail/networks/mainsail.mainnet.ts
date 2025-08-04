import { explorer, featureFlags, importMethods, transactions } from "./shared.js";

import { Networks } from "@/app/lib/mainsail";

const network: Networks.NetworkManifest = {
	coin: "Mainsail",
	constants: {
		epoch: "2017-03-21T13:00:00.000Z",
		slip44: 111,
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
		nethash: "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988",
	},
	name: "Mainnet",
	transactions,
	type: "live",
};

export default network;
