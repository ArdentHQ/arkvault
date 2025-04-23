import { Signatories } from "@ardenthq/sdk";

export interface SignatoryInput {
	encryptionPassword?: string;
	mnemonic?: string;
	secondMnemonic?: string;
	secret?: string;
	secondSecret?: string;
	wif?: string;
	privateKey?: string;
}

export interface ISignatoryFactory {
	/**
	 * Get signatory based on input data.
	 *
	 * @param {SignatoryInput} input
	 * @memberof ISignatoryFactory
	 * @return {Services.SignatoryService}
	 */
	make(input: SignatoryInput): Promise<Signatories.Signatory>;
}
