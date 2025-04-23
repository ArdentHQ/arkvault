import { IProfile } from "./contracts.js";

/**
 * Defines the implementation contract for the wallet service.
 *
 * @export
 * @interface IWalletService
 */
export interface IWalletService {
	/**
	 * Synchronise all wallets for the given profile.
	 *
	 * @param {IProfile} profile
	 * @param {Array<string>|undefined}networkIds
	 * @return {Promise<void>}
	 * @memberof IWalletService
	 */
	syncByProfile(profile: IProfile, networkIds?: string[]): Promise<void>;
}
