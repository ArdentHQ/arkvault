import { Signatories } from "@/app/lib/mainsail";

export interface SignatoryInput {
	encryptionPassword?: string;
	mnemonic?: string;
	secondMnemonic?: string;
	secret?: string;
	secondSecret?: string;
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
