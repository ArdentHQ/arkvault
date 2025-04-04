import { IoC, Services } from "@ardenthq/sdk";
import { BIP39 } from "@ardenthq/sdk-cryptography";
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
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		const { publicKey, privateKey } = BaseKeys.fromPassphrase(mnemonic, true);

		return { privateKey, publicKey };
	}

	public override async fromSecret(secret: string): Promise<Services.KeyPairDataTransferObject> {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		const { publicKey, privateKey } = BaseKeys.fromPassphrase(secret, true);

		return { privateKey, publicKey };
	}

	public override async fromWIF(wif: string): Promise<Services.KeyPairDataTransferObject> {
		const { publicKey, privateKey } = BaseKeys.fromWIF(wif, this.#config.network);

		return { privateKey, publicKey };
	}
}
