import { WIF as Base } from "@ardenthq/sdk-cryptography";

import { Network } from "../interfaces/networks";
import { KeyPair } from "./contracts";
import { getWIF } from "./helpers";
import { Keys } from "./keys";

export class WIF {
	public static fromPassphrase(passphrase: string, network?: Network): string {
		const { compressed, privateKey }: KeyPair = Keys.fromPassphrase(passphrase);

		return Base.encode({
			compressed,
			privateKey,
			version: getWIF(network),
		});
	}

	public static fromKeys(keys: KeyPair, network?: Network): string {
		return Base.encode({
			compressed: keys.compressed,
			privateKey: keys.privateKey,
			version: getWIF(network),
		});
	}
}
