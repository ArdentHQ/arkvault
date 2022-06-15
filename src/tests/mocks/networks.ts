import { Coins, Networks } from "@ardenthq/sdk";
import { ARK } from "@ardenthq/sdk-ark";

const createNetwork = (coin: Coins.CoinBundle, network: string) =>
	new Networks.Network(coin.manifest, coin.manifest.networks[network]);

export const availableNetworksMock: Networks.Network[] = [
	// createNetwork(ADA, "ada.mainnet"),
	// createNetwork(ADA, "ada.testnet"),
	createNetwork(ARK, "ark.mainnet"),
	createNetwork(ARK, "ark.devnet"),
	createNetwork(ARK, "bind.mainnet"),
	createNetwork(ARK, "bind.testnet"),
	createNetwork(ARK, "xqr.mainnet"),
	createNetwork(ARK, "xqr.testnet"),
	// createNetwork(ATOM, "atom.mainnet"),
	// createNetwork(ATOM, "atom.testnet"),
	// createNetwork(BTC, "btc.livenet"),
	// createNetwork(BTC, "btc.testnet"),
	// createNetwork(EGLD, "egld.mainnet"),
	// createNetwork(EGLD, "egld.testnet"),
	// createNetwork(ETH, "eth.mainnet"),
	// createNetwork(ETH, "eth.rinkeby"),
	// createNetwork(ETH, "eth.ropsten"),
	// createNetwork(LSK, "lsk.mainnet"),
	// createNetwork(LSK, "lsk.testnet"),
	// createNetwork(NEO, "neo.mainnet"),
	// createNetwork(NEO, "neo.testnet"),
	// createNetwork(TRX, "trx.mainnet"),
	// createNetwork(TRX, "trx.testnet"),
	// createNetwork(XLM, "xlm.mainnet"),
	// createNetwork(XLM, "xlm.testnet"),
	// createNetwork(XRP, "xrp.mainnet"),
	// createNetwork(XRP, "xrp.testnet"),
	// createNetwork(ZIL, "zil.mainnet"),
	// createNetwork(ZIL, "zil.testnet"),
];
