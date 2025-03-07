import { Network } from "../interfaces/networks";
import { configManager } from "../managers/index";

export const getWIF = (network?: Network): number => (network ? network.wif : configManager.get("network.wif"));

export const getPubKeyHash = (network?: Network): number =>
	network ? network.pubKeyHash : configManager.get("network.pubKeyHash");
