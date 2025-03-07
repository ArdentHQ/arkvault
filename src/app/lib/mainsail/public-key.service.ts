import { IoC, Services } from "@ardenthq/sdk";
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { abort_if, abort_unless } from "@ardenthq/sdk-helpers";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Application } from "@mainsail/kernel";

import { BindingType } from "./coin.contract";

export class PublicKeyService extends Services.AbstractPublicKeyService {
	readonly #app: Application;
	readonly #publicKeyFactory: Contracts.Crypto.PublicKeyFactory;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#app = container.get(BindingType.Application);

		this.#publicKeyFactory = this.#app.getTagged<Contracts.Crypto.PublicKeyFactory>(
			Identifiers.Cryptography.Identity.PublicKey.Factory,
			"type",
			"wallet",
		);
	}

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PublicKeyDataTransferObject> {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			publicKey: await this.#publicKeyFactory.fromMnemonic(mnemonic),
		};
	}

	public override async fromMultiSignature(
		min: number,
		publicKeys: string[],
	): Promise<Services.PublicKeyDataTransferObject> {
		return {
			publicKey: await this.#publicKeyFactory.fromMultiSignatureAsset({ min, publicKeys }),
		};
	}

	public override async fromSecret(secret: string): Promise<Services.PublicKeyDataTransferObject> {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		return {
			publicKey: await this.#publicKeyFactory.fromMnemonic(secret),
		};
	}

	public override async fromWIF(wif: string): Promise<Services.PublicKeyDataTransferObject> {
		return {
			publicKey: await this.#publicKeyFactory.fromWIF(wif),
		};
	}

	public override async verifyPublicKeyWithBLS(publicKey: string): Promise<boolean> {
		const consensusPublicKeyFactory: Contracts.Crypto.PublicKeyFactory = this.#app.getTagged(
			Identifiers.Cryptography.Identity.PublicKey.Factory,
			"type",
			"consensus",
		);

		return await consensusPublicKeyFactory.verify(publicKey);
	}
}
