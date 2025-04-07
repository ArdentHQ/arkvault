import { Application } from "@mainsail/kernel";
import { strict as assert } from "assert";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { IoC, Services } from "@ardenthq/sdk";
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { abort_if, abort_unless } from "@ardenthq/sdk-helpers";
import { BindingType } from "./coin.contract.js";

export class AddressService extends Services.AbstractAddressService {
	readonly #app: Application;
	readonly #addressFactory: Contracts.Crypto.AddressFactory;
	readonly #publicKeyFactory: Contracts.Crypto.PublicKeyFactory;
	readonly #keyPairFactory: Contracts.Crypto.KeyPairFactory;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#app = container.get(BindingType.Application);

		this.#addressFactory = this.#app.getTagged<Contracts.Crypto.AddressFactory>(
			Identifiers.Cryptography.Identity.Address.Factory,
			"type",
			"wallet",
		);

		this.#publicKeyFactory = this.#app.getTagged<Contracts.Crypto.PublicKeyFactory>(
			Identifiers.Cryptography.Identity.PublicKey.Factory,
			"type",
			"wallet",
		);

		this.#keyPairFactory = this.#app.getTagged<Contracts.Crypto.KeyPairFactory>(
			Identifiers.Cryptography.Identity.KeyPair.Factory,
			"type",
			"wallet",
		);
	}

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			address: await this.#addressFactory.fromMnemonic(mnemonic),
			type: "bip39",
		};
	}

	public override async fromMultiSignature({
		min,
		publicKeys,
	}: Services.MultisignatureAddressInput): Promise<Services.AddressDataTransferObject> {
		assert.ok(publicKeys);
		assert.ok(min);

		return {
			address: await this.#addressFactory.fromMultiSignatureAsset({ min, publicKeys }),
			type: "bip39",
		};
	}

	public override async fromPublicKey(
		publicKey: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		return {
			address: await this.#addressFactory.fromPublicKey(publicKey),
			type: "bip39",
		};
	}

	public override async fromPrivateKey(
		privateKey: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		const keyPair = await this.#keyPairFactory.fromPrivateKey(Buffer.from(privateKey, "hex"));

		return {
			address: await this.#addressFactory.fromPrivateKey(keyPair),
			type: "bip39",
		};
	}

	public override async fromSecret(secret: string): Promise<Services.AddressDataTransferObject> {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		const publicKey = await this.#publicKeyFactory.fromMnemonic(secret);

		return {
			address: await this.#addressFactory.fromPublicKey(publicKey),
			type: "bip39",
		};
	}

	public override async fromWIF(wif: string): Promise<Services.AddressDataTransferObject> {
		return {
			address: await this.#addressFactory.fromWIF(wif),
			type: "bip39",
		};
	}

	public override async validate(address: string): Promise<boolean> {
		return await this.#addressFactory.validate(address);
	}
}
