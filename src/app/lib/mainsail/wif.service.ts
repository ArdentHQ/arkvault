/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { Keys } from "./crypto/identities";
import { WIF } from "@ardenthq/arkvault-crypto";
import { KeyPair } from "./crypto/identities/contracts";
import { ConfigKey, ConfigRepository } from "../sdk/config";

interface WIFDataTransferObject {
	wif: string;
	path?: string;
}

export class WIFService {
	readonly #config!: ConfigRepository;

	constructor({ config }: { config: ConfigRepository }) {
		this.#config = config;
	}

	public async fromMnemonic(mnemonic: string): Promise<WIFDataTransferObject> {
		const { compressed, privateKey }: KeyPair = Keys.fromPassphrase(mnemonic);

		const wif = WIF.encode({
			compressed,
			privateKey,
			version: this.#config.get(ConfigKey.Wif),
		});

		return {
			wif,
		};
	}

	public async fromSecret(secret: string): Promise<WIFDataTransferObject> {
		return await this.fromMnemonic(secret);
	}

	public async fromPrivateKey(privateKey: string): Promise<WIFDataTransferObject> {
		const wif = WIF.encode({
			compressed: true,
			privateKey: privateKey,
			version: this.#config.get(ConfigKey.Wif),
		});

		return { wif };
	}
}
