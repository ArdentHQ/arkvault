import { Contracts } from ".";
import { Networks } from "@/app/lib/mainsail";
import { WalletTokenRepository } from "./wallet-token.repository";

export class TokenService {
	#profile: Contracts.IProfile;
	#network: Networks.Network;

	public constructor({ profile, network }: { profile: Contracts.IProfile; network: Networks.Network }) {
		this.#profile = profile;
		this.#network = network;
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
		const tokens = new WalletTokenRepository(this.#network, this.#profile);

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
