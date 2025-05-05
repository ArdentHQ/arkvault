/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
/* istanbul ignore file */

import { IdentityOptions } from "@/app/lib/sdk//shared.contract";
import {
	ConfirmationMnemonicSignatory,
	ConfirmationSecretSignatory,
	ConfirmationWIFSignatory,
	LedgerSignatory,
	MnemonicSignatory,
	PrivateKeySignatory,
	SecretSignatory,
	Signatory,
	WIFSignatory,
} from "@/app/lib/sdk/signatories";

import { AddressService } from "./address.service";
import { PrivateKeyService } from "./private-key.service";
import { PublicKeyService } from "./public-key.service";

export class SignatoryService {
	readonly #addressService: AddressService;
	readonly #privateKeyService: PrivateKeyService;
	readonly #publicKeyService: PublicKeyService;

	public constructor() {
		this.#addressService = new AddressService();
		this.#privateKeyService = new PrivateKeyService();
		this.#publicKeyService = new PublicKeyService();
	}

	public async mnemonic(mnemonic: string, options?: IdentityOptions): Promise<Signatory> {
		return new Signatory(
			new MnemonicSignatory({
				address: this.#addressService.fromMnemonic(mnemonic).address,
				options,
				privateKey: (await this.#privateKeyService.fromMnemonic(mnemonic)).privateKey,
				publicKey: this.#publicKeyService.fromMnemonic(mnemonic).publicKey,
				signingKey: mnemonic,
			}),
		);
	}

	public async confirmationMnemonic(signingKey: string, confirmKey: string): Promise<Signatory> {
		return new Signatory(
			new ConfirmationMnemonicSignatory({
				address: this.#addressService.fromMnemonic(signingKey).address,
				confirmKey,
				privateKey: (await this.#privateKeyService.fromMnemonic(signingKey)).privateKey,
				publicKey: this.#publicKeyService.fromMnemonic(signingKey).publicKey,
				signingKey,
			}),
		);
	}

	public async wif(primary: string, options?: IdentityOptions): Promise<Signatory> {
		return new Signatory(
			new WIFSignatory({
				address: this.#addressService.fromWIF(primary).address,
				options,
				privateKey: (await this.#privateKeyService.fromWIF(primary)).privateKey,
				publicKey: (await this.#publicKeyService.fromWIF(primary)).publicKey,
				signingKey: primary,
			}),
		);
	}

	public async confirmationWIF(
		signingKey: string,
		confirmKey: string,
		options?: IdentityOptions,
	): Promise<Signatory> {
		return new Signatory(
			new ConfirmationWIFSignatory({
				address: this.#addressService.fromWIF(signingKey).address,
				confirmKey,
				privateKey: (await this.#privateKeyService.fromWIF(signingKey)).privateKey,
				publicKey: (await this.#publicKeyService.fromWIF(signingKey)).publicKey,
				signingKey,
			}),
		);
	}

	public async privateKey(privateKey: string, options?: IdentityOptions): Promise<Signatory> {
		return new Signatory(
			new PrivateKeySignatory({
				address: this.#addressService.fromPrivateKey(privateKey).address,
				options,
				signingKey: privateKey,
			}),
		);
	}

	public async ledger(path: string, options?: IdentityOptions): Promise<Signatory> {
		return new Signatory(new LedgerSignatory({ options, signingKey: path }));
	}

	public async secret(secret: string, options?: IdentityOptions): Promise<Signatory> {
		return new Signatory(
			new SecretSignatory({
				address: this.#addressService.fromSecret(secret).address,
				options,
				privateKey: (await this.#privateKeyService.fromSecret(secret)).privateKey,
				publicKey: this.#publicKeyService.fromSecret(secret).publicKey,
				signingKey: secret,
			}),
		);
	}

	public async confirmationSecret(
		signingKey: string,
		confirmKey: string,
		options?: IdentityOptions,
	): Promise<Signatory> {
		return new Signatory(
			new ConfirmationSecretSignatory({
				address: this.#addressService.fromSecret(signingKey).address,
				confirmKey,
				privateKey: (await this.#privateKeyService.fromSecret(signingKey)).privateKey,
				publicKey: this.#publicKeyService.fromSecret(signingKey).publicKey,
				signingKey,
			}),
		);
	}

	/**
	 * This signatory should only be used for testing and fee calculations.
	 */
	public async stub(mnemonic: string): Promise<Signatory> {
		return new Signatory(
			new MnemonicSignatory({
				address: "address",
				privateKey: "privateKey",
				publicKey: "publicKey",
				signingKey: mnemonic,
			}),
		);
	}
}
