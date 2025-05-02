import { IdentityOptions } from "./shared.contract";

export interface ExtendedPublicKeyService {
	fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<string>;
	verifyPublicKeyWithBLS(publicKey: string): boolean;
}
