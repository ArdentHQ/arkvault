/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Services } from "@/app/lib/mainsail";
import { PrivateKey as BasePrivateKey } from "./crypto/identities/private-key";

export class PrivateKeyService {
	public async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PrivateKeyDataTransferObject> {
		return {
			privateKey: BasePrivateKey.fromPassphrase(mnemonic),
		};
	}

	public async fromSecret(secret: string): Promise<Services.PrivateKeyDataTransferObject> {
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
