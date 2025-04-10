import { Services, Exceptions } from "@/app/lib/sdk";
import { BIP39 } from "@/app/lib/crypto";
import { abort_if, abort_unless } from "@/app/lib/helpers";

import { PublicKey } from "@arkecosystem/typescript-crypto";

export class PublicKeyService {
	public fromMnemonic(mnemonic: string): Services.PublicKeyDataTransferObject {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			publicKey: PublicKey.fromPassphrase(mnemonic).publicKey,
		};
	}

	public fromSecret(secret: string): Services.PublicKeyDataTransferObject {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		return {
			publicKey: PublicKey.fromPassphrase(secret).publicKey,
		};
	}

	// @TODO: Implement
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public fromMultiSignature(min: number, publicKeys: string[]): Promise<Services.PublicKeyDataTransferObject> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.fromMultiSignature.name);
	}

	// @TODO: Implement
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public fromWIF(wif: string): Promise<Services.PublicKeyDataTransferObject> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.fromWIF.name);
	}

	// @TODO: Implement
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public verifyPublicKeyWithBLS(publicKey: string): Promise<boolean> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.verifyPublicKeyWithBLS.name);
	}
}

