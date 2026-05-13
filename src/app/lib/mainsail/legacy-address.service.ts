import { Services } from "@/app/lib/mainsail";
import { LegacyAddress, PublicKey } from "@arkecosystem/typescript-crypto";
import { BIP39 } from "@ardenthq/arkvault-crypto";
import { abort_if, abort_unless } from "@/app/lib/helpers";

export class LegacyAddressService {
	public fromMnemonic(mnemonic: string, pubKeyHash: number): Services.AddressDataTransferObject {
		// abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			address: LegacyAddress.fromPassphrase(mnemonic, pubKeyHash),
			type: "bip39",
		};
	}

	public fromPublicKey(publicKey: string, pubKeyHash: number): Services.AddressDataTransferObject {
		return {
			address: LegacyAddress.fromPublicKey(publicKey, pubKeyHash),
			type: "bip39",
		};
	}

	public fromPrivateKey(privateKey: string, pubKeyHash: number): Services.AddressDataTransferObject {
		return {
			address: LegacyAddress.fromPrivateKey(privateKey, pubKeyHash),
			type: "bip39",
		};
	}

	public fromSecret(secret: string, pubKeyHash: number): Services.AddressDataTransferObject {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		const publicKey = PublicKey.fromPassphrase(secret);

		return {
			address: LegacyAddress.fromPublicKey(publicKey.publicKey, pubKeyHash),
			type: "bip39",
		};
	}

	public validate(address: string, pubKeyHash: number): boolean {
		return LegacyAddress.validate(address, pubKeyHash);
	}
}
