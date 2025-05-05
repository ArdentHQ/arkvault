/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Services } from "@/app/lib/sdk";

import { Keys } from "./crypto/identities";
import { ConfigKey, ConfigRepository } from "../sdk/coins";
import { WIF } from "@ardenthq/arkvault-crypto";
import { KeyPair } from "./crypto/identities/contracts";

export class WIFService {
	readonly #config!: ConfigRepository;

	public constructor({ config }: { config: ConfigRepository }) {
		this.#config = config;
	}

	public async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.WIFDataTransferObject> {
		const { compressed, privateKey }: KeyPair = Keys.fromPassphrase(mnemonic);

		const wif = WIF.encode({
			compressed,
			privateKey,
			version: this.#config.get(ConfigKey.Wif),
		});

		return {
			wif
		};
	}

	public async fromSecret(secret: string): Promise<Services.WIFDataTransferObject> {
		return await this.fromMnemonic(secret);
	}

	public async fromPrivateKey(privateKey: string): Promise<Services.WIFDataTransferObject> {

		const wif = WIF.encode({
			compressed: true,
			privateKey: privateKey,
			version: this.#config.get(ConfigKey.Wif),
		});

		return { wif }
	}
}
