import { Services } from "@ardenthq/sdk";

/**
 * Defines the implementation contract for the wallet mutator.
 *
 * @export
 * @interface IWalletMutator
 */
export interface IWalletMutator {
	/**
	 * Set the coin and network that should be communicated with.
	 *
	 * @param {string} coin
	 * @param {string} network
	 * @param {{ sync: boolean }} [options]
	 * @return {Promise<void>}
	 * @memberof IWalletMutator
	 */
	coin(coin: string, network: string, options?: { sync: boolean }): Promise<void>;

	/**
	 * Set the identity based on a mnemonic.
	 *
	 * @param {string} mnemonic
	 * @param {Services.IdentityOptions} [options]
	 * @return {Promise<void>}
	 * @memberof IWalletMutator
	 */
	identity(mnemonic: string, options?: Services.IdentityOptions): Promise<void>;

	/**
	 * Set the address and optionally synchronise the wallet.
	 *
	 * @param {Partial<AddressDataTransferObject>} address
	 * @return {Promise<void>}
	 * @memberof IWalletMutator
	 */
	address(address: Partial<Services.AddressDataTransferObject>, options?: { ttl?: number }): Promise<void>;

	/**
	 * Set the avatar.
	 *
	 * @param {string} value
	 * @return {void}
	 * @memberof IWalletMutator
	 */
	avatar(value: string): void;

	/**
	 * Set the alias.
	 *
	 * @param {string} alias
	 * @return {void}
	 * @memberof IWalletMutator
	 */
	alias(alias: string): void;

	/**
	 * Removes the encryption password.
	 *
	 * @param {string} password
	 * @return {Promise<void>}
	 * @memberof IWalletMutator
	 */
	removeEncryption(password: string): Promise<void>;
}
