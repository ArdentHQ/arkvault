/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { IoC, Services } from "@ardenthq/sdk";
import { BIP39 } from "@/app/lib/crypto";
import { abort_if, abort_unless } from "@/app/lib/helpers";

import { BindingType } from "./coin.contract";
import { WIF as BaseWIF } from "./crypto/identities/wif";
import { Interfaces } from "./crypto/index";

export class WIFService extends Services.AbstractWIFService {
	readonly #config!: Interfaces.NetworkConfig;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#config = container.get(BindingType.Crypto);
	}

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.WIFDataTransferObject> {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			wif: BaseWIF.fromPassphrase(mnemonic, this.#config.network),
		};
	}

	public override async fromSecret(secret: string): Promise<Services.WIFDataTransferObject> {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		return {
			wif: BaseWIF.fromPassphrase(secret, this.#config.network),
		};
	}

	public override async fromPrivateKey(privateKey: string): Promise<Services.WIFDataTransferObject> {
		return {
			// @ts-ignore - We don't care about having a public key for this
			wif: BaseWIF.fromKeys({ compressed: true, privateKey }),
		};
	}
}
