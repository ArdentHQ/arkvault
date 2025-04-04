/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { IoC, Services } from "@ardenthq/sdk";
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { abort_if, abort_unless } from "@/app/lib/helpers";

import { BindingType } from "./coin.contract";
import { PrivateKey as BasePrivateKey } from "./crypto/identities/private-key";
import { Interfaces } from "./crypto/index";

export class PrivateKeyService extends Services.AbstractPrivateKeyService {
	readonly #config!: Interfaces.NetworkConfig;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#config = container.get(BindingType.Crypto);
	}

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PrivateKeyDataTransferObject> {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			privateKey: BasePrivateKey.fromPassphrase(mnemonic),
		};
	}

	public override async fromSecret(secret: string): Promise<Services.PrivateKeyDataTransferObject> {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		return {
			privateKey: BasePrivateKey.fromPassphrase(secret),
		};
	}

	public override async fromWIF(wif: string): Promise<Services.PrivateKeyDataTransferObject> {
		return {
			privateKey: BasePrivateKey.fromWIF(wif),
		};
	}
}
