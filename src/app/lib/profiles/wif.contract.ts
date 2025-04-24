export interface IWalletImportFormat {
	/**
	 * Get the WIF.
	 *
	 * @param {string} password
	 * @return {string}
	 * @memberof IReadWriteWallet
	 */
	get(password: string): Promise<string>;

	/**
	 * Set the WIF.
	 *
	 * @param {string} mnemonic
	 * @param {string} password
	 * @return {void}
	 * @memberof IReadWriteWallet
	 */
	set(mnemonic: string, password: string): Promise<void>;

	/**
	 * Determine if the wallet uses a WIF.
	 *
	 * @return {boolean}
	 * @memberof IReadWriteWallet
	 */
	exists(): boolean;

	/**
	 * Remove the password from the currently selected wallet.
	 *
	 * @param {string} password
	 * @return {void}
	 * @memberof IReadWriteWallet
	 */
	forget(password: string): void;
}
