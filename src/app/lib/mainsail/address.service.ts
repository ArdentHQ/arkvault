import { Application } from "@mainsail/kernel";
import { IoC, Services, Exceptions } from "@/app/lib/sdk";
import { BIP39 } from "@/app/lib/crypto";
import { abort_if, abort_unless } from "@/app/lib/helpers";
import { Address, PrivateKey, PublicKey } from "@arkecosystem/typescript-crypto";

import { Contracts, Identifiers } from "@mainsail/contracts";
import { BindingType } from "./coin.contract.js";
import { MultisignatureAddressInput } from "@/app/lib/sdk/shared.contract";
import { AddressDataTransferObject } from "@/app/lib/sdk/address.contract.js";

export class AddressService {
	readonly #app: Application;

	// @TODO: Remove constructor and IoC related calls once @mainsail packages will be deprecated.
	// Temporarily keeping it as removing `getTagged` throws an exception on page load, related to IoC container initialization:
	// "Uncaught TypeError: Reflect.hasOwnMetadata is not a function".
	public constructor(container: IoC.IContainer) {
		this.#app = container.get(BindingType.Application);

		this.#app.getTagged<Contracts.Crypto.AddressFactory>(
			Identifiers.Cryptography.Identity.Address.Factory,
			"type",
			"wallet",
		);
	}

	public fromMnemonic(mnemonic: string): Services.AddressDataTransferObject {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			address: Address.fromPassphrase(mnemonic),
			type: "bip39",
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public fromMultiSignature(input: MultisignatureAddressInput): AddressDataTransferObject {
		throw new Exceptions.NotImplemented(this.constructor.name, this.fromMultiSignature.name);
	}


	public fromPublicKey(publicKey: string): Services.AddressDataTransferObject {
		return {
			address: Address.fromPublicKey(publicKey),
			type: "bip39",
		};
	}

	public fromPrivateKey(privateKey: string): Services.AddressDataTransferObject {
		return {
			address: Address.fromPrivateKey(privateKey),
			type: "bip39",
		};
	}

	public fromSecret(secret: string): Services.AddressDataTransferObject {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		const publicKey = PublicKey.fromPassphrase(secret);

		return {
			address: Address.fromPublicKey(publicKey.publicKey),
			type: "bip39",
		};
	}

	public fromWIF(wif: string): Services.AddressDataTransferObject {
		const privateKey = PrivateKey.fromWif(wif);

		return {
			address: Address.fromPrivateKey(privateKey.privateKey),
			type: "bip39",
		};
	}

	public validate(address: string): boolean {
		return Address.validate(address);
	}
}
