import { Contracts } from ".";
import { Networks } from "@/app/lib/mainsail";
import { WalletTokenRepository } from "./wallet-token.repository";
import { ProfileSetting } from "./profile.enum.contract";
import { WalletToken } from "./wallet-token";

export class TokenService {
	#profile: Contracts.IProfile;
	#network: Networks.Network;
	#dustBalanceThreshold = 1;

	public constructor({ profile, network }: { profile: Contracts.IProfile; network: Networks.Network }) {
		this.#profile = profile;
		this.#network = network;
	}

	/**
	 * Returns wallet tokens filtering out dust tokens if the setting is enabled.
	 *
	 * @param wallet
	 * @returns {WalletToken[]}
	 */
	#walletTokens(wallet: Contracts.IReadWriteWallet): WalletToken[] {
		const hideDustTokens = this.#profile.settings().get(ProfileSetting.HideDustTokens);

		return wallet
			.tokens()
			.values()
			.filter((token) => {
				if (hideDustTokens === true) {
					return token.balance() > this.#dustBalanceThreshold;
				}

				return true;
			});
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
			count = count + this.#walletTokens(wallet).length;
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
			for (const token of this.#walletTokens(wallet)) {
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
