/**
 * Defines the implementation contract for the wallet synchroniser.
 *
 * @export
 * @interface IWalletSynchroniser
 */
export interface IWalletSynchroniser {
	/**
	 * Synchronise the wallet identity.
	 *
	 * @param {Object} [options]
	 * @param {number} [options.ttl]
	 * @return {Promise<void>}
	 * @memberof IReadWriteWallet
	 */
	identity(options?: { ttl?: number }): Promise<void>;

	/**
	 * Synchronise the votes.
	 *
	 * @return {Promise<void>}
	 * @memberof IReadWriteWallet
	 */
	votes(): Promise<void>;

	/**
	 * Synchronise wallet tokens.
	 *
	 * @return {Promise<void>}
	 * @memberof IReadWriteWallet
	 */
	tokens(): Promise<void>;
}
