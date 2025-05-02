import { Services } from "@/app/lib/sdk";

import { IProfile } from "./contracts.js";

/**
 * Defines the implementation contract for the fee service.
 *
 * @export
 * @interface IFeeService
 */
export interface IFeeService {
	/**
	 * Get all fees for the given coin and network.
	 *
	 * @param {string} coin
	 * @param {string} network
	 * @return {Services.TransactionFees}
	 * @memberof IFeeService
	 */
	all(coin: string, network: string): Services.TransactionFees;

	/**
	 * Get fees for the given coin, network and type.
	 *
	 * @param {string} coin
	 * @param {string} network
	 * @param {string} type
	 * @return {Services.TransactionFee}
	 * @memberof IFeeService
	 */
	findByType(network: string, type: string): Services.TransactionFee;

	/**
	 * Synchronise fees for the given coin and network.
	 *
	 * @param {IProfile} profile
	 * @return {Promise<void>}
	 * @memberof IFeeService
	 */
	sync(profile: IProfile): Promise<void>;
}
