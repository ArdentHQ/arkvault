import { Services } from "@/app/lib/sdk";
import { Address, PrivateKey, PublicKey } from "@arkecosystem/typescript-crypto";

export class AddressService {

	public fromMnemonic(mnemonic: string): Services.AddressDataTransferObject {
		return {
			address: Address.fromPassphrase(mnemonic),
			type: "bip39",
		};
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
