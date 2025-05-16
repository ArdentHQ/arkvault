import { PBKDF2 } from "@ardenthq/arkvault-crypto";

import { IReadWriteWallet, IWalletImportFormat } from "./contracts.js";

// @TODO: rename to something better
export class WalletImportFormat implements IWalletImportFormat {
	readonly #wallet: IReadWriteWallet;
	readonly #key: string;

	public constructor(wallet: IReadWriteWallet, key: string) {
		this.#wallet = wallet;
		this.#key = key;
	}

	/** {@inheritDoc IWalletImportFormat.get} */
	public async get(password: string): Promise<string> {
		const encryptedKey: string | undefined = this.#wallet.data().get(this.#key);

		if (encryptedKey === undefined) {
			throw new Error("This wallet does not use PBKDF2 encryption.");
		}

		return await PBKDF2.decrypt(encryptedKey, password);
	}

	/** {@inheritDoc IWalletImportFormat.set} */
	public async set(value: string, password: string): Promise<void> {
		const encryptedKey = await PBKDF2.encrypt(value, password);
		this.#wallet.data().set(this.#key, encryptedKey);
		this.#wallet.profile().status().markAsDirty();
	}

	/** {@inheritDoc IWalletImportFormat.exists} */
	public exists(): boolean {
		return this.#wallet.data().has(this.#key);
	}

	public forget(): void {
		if (!this.exists()) {
			throw new Error("This wallet does not use PBKDF2 encryption.");
		}

		this.#wallet.data().forget(this.#key);

		this.#wallet.profile().status().markAsDirty();
	}
}
