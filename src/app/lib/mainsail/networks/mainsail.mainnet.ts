import { Networks } from "@/app/lib/mainsail";

import { explorer, featureFlags, importMethods, transactions } from "./shared.js";

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
			host: "http://0.0.0.0:4003/api",
			type: "full",
		},
		{
			host: "http://0.0.0.0:4007/api",
			type: "tx",
		},
		{
			host: "https://explorer-evm-test.mainsailhq.com",
			type: "explorer",
		},
		{
			host: "http://0.0.0.0:4008/api",
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
