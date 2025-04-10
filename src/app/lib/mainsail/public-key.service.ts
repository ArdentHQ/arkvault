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
	public fromMultiSignature(min: number, publicKeys: string[]): Promise<Services.PublicKeyDataTransferObject> {
		console.log({ min, publicKeys })
		throw new Exceptions.NotImplemented(this.constructor.name, this.fromMultiSignature.name);
	}

	// @TODO: Implement
	public fromWIF(wif: string): Promise<Services.PublicKeyDataTransferObject> {
		console.log({ wif })
		throw new Exceptions.NotImplemented(this.constructor.name, this.fromWIF.name);
	}

	// @TODO: Implement
	public verifyPublicKeyWithBLS(publicKey: string): Promise<boolean> {
		console.log({ publicKey })
		throw new Exceptions.NotImplemented(this.constructor.name, this.verifyPublicKeyWithBLS.name);
	}
}

