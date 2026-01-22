import { Contracts } from ".";
import { Networks } from "@/app/lib/mainsail";
import { ClientService } from "@/app/lib/mainsail/client.service";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import { WalletTokensQuery } from "@/app/lib/mainsail/client.contract";
import { ProfileSetting } from "./profile.enum.contract";
import { WalletToken } from "./wallet-token";

export class TokenService {
	#profile: Contracts.IProfile;
	#network: Networks.Network;
	#dustBalanceThreshold = 1;
	#walletTokensCollection: WalletTokenCollection;

	public constructor({ profile, network }: { profile: Contracts.IProfile; network: Networks.Network }) {
		this.#profile = profile;
		this.#network = network;
		this.#walletTokensCollection = new WalletTokenCollection([], {
			last: undefined,
			next: 0,
			prev: undefined,
			self: undefined,
		});
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
	public async sync(query?: WalletTokensQuery): Promise<void> {
		await this.#syncTokenAddresses(query);
		const walletTokens = this.#walletTokensCollection.items();

		for (const walletToken of walletTokens) {
			const wallet = this.#profile.wallets().findByAddressWithNetwork(walletToken.address(), this.#network.id());

			wallet?.tokens().push(walletToken);
		}
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
	async #syncTokenAddresses(query?: WalletTokensQuery): Promise<void> {
		const clientService = new ClientService({
			config: this.#profile.activeNetwork().config(),
			profile: this.#profile,
		});

		try {
			const response = await clientService.tokenAddresses({
				addresses: this.#profile
					.wallets()
					.selected()
					.map((wallet) => wallet.address()),
				...(query ?? {}),
			});

			this.#walletTokensCollection = new WalletTokenCollection(response.items(), {
				last: undefined,
				next: Number(response.nextPage()),
				prev: undefined,
				self: undefined,
			});
		} catch {
			this.#walletTokensCollection = new WalletTokenCollection([], {
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			});
		}
	}

	selected(): WalletTokenCollection {
		return this.#walletTokensCollection;
	}

	/**
	 * Calculates the total balance of all tokens from selected wallets.
	 *
	 * @returns {number}
	 */
	selectedTotalBalance(): number {
		let total = 0;

		for (const wallet of this.#profile.wallets().selected().values()) {
			for (const token of wallet.tokens().values()) {
				total = total + token.balance();
			}
		}

		return total;
	}
}
