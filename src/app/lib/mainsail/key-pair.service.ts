/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { IoC, Services } from "@ardenthq/sdk";
import { abort_if, abort_unless } from "@/app/lib/helpers";

import { BindingType } from "./coin.contract";
import { Keys as BaseKeys } from "./crypto/identities/keys";
import { Interfaces } from "./crypto/index";

export class KeyPairService extends Services.AbstractKeyPairService {
	readonly #config!: Interfaces.NetworkConfig;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#config = container.get(BindingType.Crypto);
	}

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.KeyPairDataTransferObject> {
		const { publicKey, privateKey } = BaseKeys.fromPassphrase(mnemonic, true);

		return { privateKey, publicKey };
	}

	public override async fromSecret(secret: string): Promise<Services.KeyPairDataTransferObject> {
		const { publicKey, privateKey } = BaseKeys.fromPassphrase(secret, true);

		return { privateKey, publicKey };
	}

	public override async fromWIF(wif: string): Promise<Services.KeyPairDataTransferObject> {
		const { publicKey, privateKey } = BaseKeys.fromWIF(wif, this.#config.network);

		return { privateKey, publicKey };
	}
}
