import { IProfile, IReadOnlyWallet, IReadWriteWallet } from "./contracts.js";

/**
 * Defines the implementation contract for the delegate service.
 *
 * @export
 * @interface IDelegateService
 */
export interface IValidatorService {
	/**
	 * Get all validators for the given coin and network.
	 *
	 * @param {string} coin
	 * @param {string} network
	 * @return {IReadOnlyWallet[]}
	 * @memberof IDelegateService
	 */
	all(coin: string, network: string): IReadOnlyWallet[];

	/**
	 * Find the validator for the given coin, network and address.
	 *
	 * @param {string} coin
	 * @param {string} network
	 * @param {string} address
	 * @return {IReadOnlyWallet}
	 * @memberof IDelegateService
	 */
	findByAddress(coin: string, network: string, address: string): IReadOnlyWallet;

	/**
	 * Find the validator for the given coin, network and public key.
	 *
	 * @param {string} coin
	 * @param {string} network
	 * @param {string} publicKey
	 * @return {IReadOnlyWallet}
	 * @memberof IDelegateService
	 */
	findByPublicKey(coin: string, network: string, publicKey: string): IReadOnlyWallet;

	/**
	 * Find the validator for the given coin, network and username.
	 *
	 * @param {string} coin
	 * @param {string} network
	 * @param {string} username
	 * @return {IReadOnlyWallet}
	 * @memberof IValidatorService
	 */
	findByUsername(coin: string, network: string, username: string): IReadOnlyWallet;

	/**
	 * Synchronise validators for the given coin and network.
	 *
	 * @param {IProfile} profile
	 * @param {string} coin
	 * @param {string} network
	 * @return {Promise<void>}
	 * @memberof IValidatorService
	 */
	sync(profile: IProfile, coin: string, network: string): Promise<void>;

	/**
	 * Synchronise validators for all coins and networks.
	 *
	 * @param {IProfile} profile
	 * @return {Promise<void>}
	 * @memberof IValidatorService
	 */
	syncAll(profile: IProfile): Promise<void>;

	/**
	 * Map the given public keys to delegates of the coin and network of the given wallet.
	 *
	 * @param {IReadWriteWallet} wallet
	 * @param {string[]} publicKeys
	 * @return {IReadOnlyWallet[]}
	 * @memberof IValidatorService
	 */
	map(wallet: IReadWriteWallet, publicKeys: string[]): IReadOnlyWallet[];

	/**
	 * Map the given identifier to a delegate of the coin and network of the given wallet.
	 *
	 * @param {IReadWriteWallet} wallet
	 * @param {string} identifier
	 * @return {IReadOnlyWallet[]}
	 * @memberof IValidatorService
	 */
	mapByIdentifier(wallet: IReadWriteWallet, identifier: string): IReadOnlyWallet | undefined;
}
