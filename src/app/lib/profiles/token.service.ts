import { Contracts } from ".";
import { WalletTokenRepository } from "./wallet-token.repository";

export class TokenService {
	#profile: Contracts.IProfile;

	public constructor({ profile }: { profile: Contracts.IProfile }) {
		this.#profile = profile;
	}

	/**
	 * Synchronises tokens for all selected wallets.
	 *
	 * @returns {Promise<void>}
	 */
	public async sync(): Promise<void> {
		await Promise.allSettled(
			this.#profile
				.wallets()
				.selected()
				.values()
				.map((wallet) => wallet.synchroniser().tokens()),
		);
	}

	/**
	 * Retrieves the total count of tokens from all selected wallets.
	 *
	 * @returns {number}
	 */
	selectedCount(): number {
		let count = 0;

		for (const wallet of this.#profile.wallets().selected().values()) {
			count = count + wallet.tokens().count();
		}

		return count;
	}

	/**
	 * Retrieves all tokens from selected wallets.
	 *
	 * @returns {WalletTokenRepository}
	 */
	selected(): WalletTokenRepository {
		const tokens = new WalletTokenRepository();

		for (const wallet of this.#profile.wallets().selected().values()) {
			for (const token of wallet.tokens().values()) {
				tokens.push(token);
			}
		}

		return tokens;
	}

	/**
	 * Calculates the total balance of all tokens from selected wallets.
	 *
	 * @returns {number}
	 */
	selectedTotalBalance(): number {
		let total = 0;

		for (const token of this.selected().values()) {
			total = total + token.balance();
		}

		return total;
	}
}
