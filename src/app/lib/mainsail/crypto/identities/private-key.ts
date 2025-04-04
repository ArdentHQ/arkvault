import { Network } from "@/app/lib/mainsail/crypto/interfaces/networks";
import { Keys } from "./keys";

export class PrivateKey {
	public static fromPassphrase(passphrase: string): string {
		return Keys.fromPassphrase(passphrase).privateKey;
	}

	public static fromWIF(wif: string, network?: Network): string {
		return Keys.fromWIF(wif, network).privateKey;
	}
}
