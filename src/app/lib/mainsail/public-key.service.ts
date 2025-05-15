import { Services, Exceptions } from "@/app/lib/mainsail";

import { PublicKey } from "@arkecosystem/typescript-crypto";
import { Bls } from "@ardenthq/arkvault-crypto";

export class PublicKeyService {
	public fromMnemonic(mnemonic: string): Services.PublicKeyDataTransferObject {
		return {
			publicKey: PublicKey.fromPassphrase(mnemonic).publicKey,
		};
	}

	public fromSecret(secret: string): Services.PublicKeyDataTransferObject {
		return {
			publicKey: PublicKey.fromPassphrase(secret).publicKey,
		};
	}

	// @TODO: Implement
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public fromWIF(wif: string): Promise<Services.PublicKeyDataTransferObject> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.fromWIF.name);
	}

	public verifyPublicKeyWithBLS(publicKey: string): boolean {
		return Bls.verify(publicKey);
	}
}
