import { IReadOnlyWallet } from "./contracts.js";

export interface VoteRegistryItem {
	amount: number;
	wallet?: IReadOnlyWallet;
}

export interface IVoteRegistry {
	/**
	 * Get all wallets the wallet is voting for.
	 *
	 * @return {VoteRegistryItem}
	 * @memberof IReadWriteWallet
	 */
	current(): VoteRegistryItem[];

	/**
	 * Get the number of votes that remain to be casted.
	 *
	 * @return {number}
	 * @memberof IReadWriteWallet
	 */
	available(): number;

	/**
	 * Get the number of votes that have been casted.
	 *
	 * @return {number}
	 * @memberof IReadWriteWallet
	 */
	used(): number;
}
