import { Network } from "@/app/lib/mainsail/crypto/interfaces/networks";
import { configManager } from "@/app/lib/mainsail/crypto/managers/index";

export const getWIF = (network?: Network): number => (network ? network.wif : configManager.get("network.wif"));

export const getPubKeyHash = (network?: Network): number =>
	network ? network.pubKeyHash : configManager.get("network.pubKeyHash");
