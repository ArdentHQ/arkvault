import { IProfile, IReadOnlyWallet, IReadWriteWallet } from "./contracts.js";

/**
 * Defines the implementation contract for the delegate service.
 *
 * @export
 * @interface IDelegateService
 */
export interface IValidatorService {
	/**
	 * Get all validators for the given network.
	 *
	 * @param {string} network
	 * @return {IReadOnlyWallet[]}
	 * @memberof IDelegateService
	 */
	all(network: string): IReadOnlyWallet[];

	/**
	 * Find the validator for the given network and address.
	 *
	 * @param {string} network
	 * @param {string} address
	 * @return {IReadOnlyWallet}
	 * @memberof IDelegateService
	 */
	findByAddress(network: string, address: string): IReadOnlyWallet;

	/**
	 * Find the validator for the given network and public key.
	 *
	 * @param {string} network
	 * @param {string} publicKey
	 * @return {IReadOnlyWallet}
	 * @memberof IDelegateService
	 */
	findByPublicKey(network: string, publicKey: string): IReadOnlyWallet;

	/**
	 * Find the validator for the given network and username.
	 *
	 * @param {string} network
	 * @param {string} username
	 * @return {IReadOnlyWallet}
	 * @memberof IValidatorService
	 */
	findByUsername(network: string, username: string): IReadOnlyWallet;

	/**
	 * Synchronise validators for the given and network.
	 *
	 * @param {string} network
	 * @return {Promise<void>}
	 * @memberof IValidatorService
	 */
	sync(network: string): Promise<void>;

	/**
	 * Synchronise validators for all networks.
	 *
	 * @return {Promise<void>}
	 * @memberof IValidatorService
	 */
	syncAll(): Promise<void>;

	/**
	 * Map the given public keys to delegates of the network of the given wallet.
	 *
	 * @param {IReadWriteWallet} wallet
	 * @param {string[]} publicKeys
	 * @return {IReadOnlyWallet[]}
	 * @memberof IValidatorService
	 */
	map(wallet: IReadWriteWallet, publicKeys: string[]): IReadOnlyWallet[];

	/**
	 * Map the given identifier to a delegate of the network of the given wallet.
	 *
	 * @param {IReadWriteWallet} wallet
	 * @param {string} identifier
	 * @return {IReadOnlyWallet[]}
	 * @memberof IValidatorService
	 */
	mapByIdentifier(wallet: IReadWriteWallet, identifier: string): IReadOnlyWallet | undefined;
}
