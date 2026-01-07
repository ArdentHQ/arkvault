import { Contracts } from ".";
import { Networks } from "@/app/lib/mainsail";
import { WalletTokenRepository } from "./wallet-token.repository";
import { ClientService } from "@/app/lib/mainsail/client.service";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import { WalletTokensQuery } from "@/app/lib/mainsail/client.contract";

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
		await this.#profile.tokens().selected();
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
	async selected(query?: WalletTokensQuery): Promise<WalletTokenCollection> {
		const clientService = new ClientService({
			config: this.#profile.activeNetwork().config(),
			profile: this.#profile,
		});

		let response: WalletTokenCollection;

		try {
			response = await clientService.tokenAddresses({
				addresses: this.#profile.wallets().selected().map(wallet => wallet.address()),
				...(query ?? {}),
			});
		} catch {
			return new WalletTokenCollection([], {
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			});
		}

		return new WalletTokenCollection(response.items(), {
			last: undefined,
			next: Number(response.nextPage()),
			prev: undefined,
			self: undefined,
		});
	}

	/**
	 * Calculates the total balance of all tokens from selected wallets.
	 *
	 * @returns {number}
	 */
	async selectedTotalBalance(): Promise<number> {
		let total = 0;
		const walletTokens = await this.selected();

		for (const token of walletTokens.items()) {
			total = total + token.balance();
		}

		return total;
	}
}
