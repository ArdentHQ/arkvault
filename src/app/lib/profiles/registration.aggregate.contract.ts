import { IReadWriteWallet } from "./contracts.js";

/**
 * Defines the implementation contract for the registration aggregate.
 *
 * @export
 * @interface IRegistrationAggregate
 */
export interface IRegistrationAggregate {
	/**
	 * Aggregate all wallets that are validators and synchronised.
	 *
	 * @return {IReadWriteWallet[]}
	 * @memberof IRegistrationAggregate
	 */
	validators(): IReadWriteWallet[];
}
