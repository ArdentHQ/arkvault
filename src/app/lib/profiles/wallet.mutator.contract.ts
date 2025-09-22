import { Services } from "@/app/lib/mainsail";

/**
 * Defines the implementation contract for the wallet mutator.
 *
 * @export
 * @interface IWalletMutator
 */
export interface IWalletMutator {
	/**
	 * Set the identity based on a mnemonic.
	 *
	 * @param {string} mnemonic
	 * @return {Promise<void>}
	 * @memberof IWalletMutator
	 */
	identity(mnemonic: string): Promise<void>;

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
	 * Set the accountName
	 *
	 * @param {string} name
	 * @return {void}
	 * @memberof IWalletMutator
	 */
	accountName(name: string): void;

	/**
	 * Set the selected flag.
	 *
	 * @param {boolean} isSelected
	 * @return {void}
	 * @memberof IWalletMutator
	 */
	isSelected(isSelected: boolean): void;

	/**
	 * Removes the encryption password.
	 *
	 * @param {string} password
	 * @return {Promise<void>}
	 * @memberof IWalletMutator
	 */
	removeEncryption(password: string): Promise<void>;
}
