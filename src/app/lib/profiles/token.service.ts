import { Contracts } from ".";
import { Networks } from "@/app/lib/mainsail";
import { ClientService } from "@/app/lib/mainsail/client.service";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import { TokenTransfersQuery, WalletTokensQuery } from "@/app/lib/mainsail/client.contract";
import { ProfileSetting } from "./profile.enum.contract";
import { WalletToken } from "./wallet-token";
import { ConfirmedTransactionDataCollection } from "@/app/lib/mainsail/transactions.collection";
import { ExtendedConfirmedTransactionData } from "@/app/lib/profiles/transaction.dto";
import { ExtendedConfirmedTransactionDataCollection } from "@/app/lib/profiles/transaction.collection";

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
		const walletTokensCollection = await this.#profile.tokens().selected();
		const walletTokens = walletTokensCollection.items();

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
	async selected(query?: WalletTokensQuery): Promise<WalletTokenCollection> {
		const clientService = new ClientService({
			config: this.#profile.activeNetwork().config(),
			profile: this.#profile,
		});

		let response: WalletTokenCollection;

		try {
			response = await clientService.tokenAddresses({
				addresses: this.#profile
					.wallets()
					.selected()
					.map((wallet) => wallet.address()),
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
	 * Retrieves all tokens from selected wallets.
	 *
	 * @returns {WalletTokenRepository}
	 */
	async transfers(query?: TokenTransfersQuery): Promise<ExtendedConfirmedTransactionDataCollection> {
		const activeNetwork = this.#profile.activeNetwork();

		const clientService = new ClientService({
			config: activeNetwork.config(),
			profile: this.#profile,
		});

		let response: ConfirmedTransactionDataCollection;

		try {
			response = await clientService.tokenTransfers({
				from: this.#profile
					.wallets()
					.selected()
					.map((wallet) => wallet.address()),
				...(query ?? {}),
			});
		} catch {
			return new ExtendedConfirmedTransactionDataCollection([], {
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			});
		}

		const findWallet = (from: string, to: string): Contracts.IReadWriteWallet => {
			const fromWallet = this.#profile.wallets().findByAddressWithNetwork(from, activeNetwork.id());

			if (fromWallet) {
				return fromWallet;
			}

			return this.#profile
				.wallets()
				.findByAddressWithNetwork(to, activeNetwork.id()) as Contracts.IReadWriteWallet;
		};

		const transfers = response
			.items()
			.map(
				(transfer) =>
					new ExtendedConfirmedTransactionData(findWallet(transfer.from(), transfer.to()), transfer),
			);

		return new ExtendedConfirmedTransactionDataCollection(transfers, response.getPagination());
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
