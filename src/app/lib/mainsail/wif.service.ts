/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Services } from "@/app/lib/sdk";

import { BindingType } from "./coin.contract";
import { WIF as BaseWIF } from "./crypto/identities/wif";
import { Interfaces, Managers } from "./crypto/index";
import { configManager } from "./crypto/managers";

export class WIFService {
	readonly #config!: Interfaces.NetworkConfig;

	public constructor() {
		this.#config = Managers.configManager.all() as Interfaces.NetworkConfig
	}

	public async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.WIFDataTransferObject> {
		return {
			wif: BaseWIF.fromPassphrase(mnemonic, this.#config.network),
		};
	}

	public async fromSecret(secret: string): Promise<Services.WIFDataTransferObject> {
		return {
			wif: BaseWIF.fromPassphrase(secret, this.#config.network),
		};
	}

	public async fromPrivateKey(privateKey: string): Promise<Services.WIFDataTransferObject> {
		return {
			// @ts-ignore - We don't care about having a public key for this
			wif: BaseWIF.fromKeys({ compressed: true, privateKey }),
		};
	}
}
