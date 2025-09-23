/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
/* istanbul ignore file */

import { IdentityOptions } from "@/app/lib/mainsail/shared.contract";
import {
	ConfirmationMnemonicSignatory,
	ConfirmationSecretSignatory,
	LedgerSignatory,
	MnemonicSignatory,
	SecretSignatory,
	Signatory,
} from "@/app/lib/mainsail/signatories";

import { AddressService } from "./address.service";
import { PublicKeyService } from "./public-key.service";
import { HDWalletSignatory } from "@/app/lib/mainsail/hd-wallet.signatory";

export class SignatoryService {
	readonly #addressService: AddressService;
	readonly #publicKeyService: PublicKeyService;

	public constructor() {
		this.#addressService = new AddressService();
		this.#publicKeyService = new PublicKeyService();
	}

	public async mnemonic(mnemonic: string, options?: IdentityOptions): Promise<Signatory> {
		return new Signatory(
			new MnemonicSignatory({
				address: this.#addressService.fromMnemonic(mnemonic).address,
				options,
				publicKey: this.#publicKeyService.fromMnemonic(mnemonic).publicKey,
				signingKey: mnemonic,
			}),
		);
	}

	public async bip44Mnemonic(mnemonic: string, path: string): Promise<Signatory> {
		return new Signatory(
			new HDWalletSignatory({
				signingKey: mnemonic,
				path,
			}),
		);
	}

	public async confirmationMnemonic(signingKey: string, confirmKey: string): Promise<Signatory> {
		return new Signatory(
			new ConfirmationMnemonicSignatory({
				address: this.#addressService.fromMnemonic(signingKey).address,
				confirmKey,
				publicKey: this.#publicKeyService.fromMnemonic(signingKey).publicKey,
				signingKey,
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
				publicKey: "publicKey",
				signingKey: mnemonic,
			}),
		);
	}
}
