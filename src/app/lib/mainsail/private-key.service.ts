/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Services } from "@/app/lib/mainsail";
import { PrivateKey as BasePrivateKey } from "./crypto/identities/private-key";
import { BIP39 } from "@ardenthq/arkvault-crypto";
import { abort_if, abort_unless } from "@/app/lib/helpers";

export class PrivateKeyService {
	public async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PrivateKeyDataTransferObject> {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			privateKey: BasePrivateKey.fromPassphrase(mnemonic),
		};
	}

	public async fromSecret(secret: string): Promise<Services.PrivateKeyDataTransferObject> {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		return {
			privateKey: BasePrivateKey.fromPassphrase(secret),
		};
	}

	public async fromWIF(wif: string): Promise<Services.PrivateKeyDataTransferObject> {
		return {
			privateKey: BasePrivateKey.fromWIF(wif),
		};
	}
}
