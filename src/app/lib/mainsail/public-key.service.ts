import { Services, Exceptions } from "@/app/lib/mainsail";

import { PublicKey } from "@arkecosystem/typescript-crypto";
import { BIP39, Bls } from "@ardenthq/arkvault-crypto";
import { abort_if, abort_unless } from "@/app/lib/helpers";

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

	public verifyPublicKeyWithBLS(publicKey: string): boolean {
		return Bls.verify(publicKey);
	}
}
