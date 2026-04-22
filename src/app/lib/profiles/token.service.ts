import { Contracts } from ".";
import { Networks } from "@/app/lib/mainsail";
import { ClientService } from "@/app/lib/mainsail/client.service";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import { TokenTransfersQuery, WalletTokensQuery } from "@/app/lib/mainsail/client.contract";
import { WalletToken } from "./wallet-token";
import { ConfirmedTransactionDataCollection } from "@/app/lib/mainsail/transactions.collection";
import { ExtendedConfirmedTransactionData } from "@/app/lib/profiles/transaction.dto";
import { ExtendedConfirmedTransactionDataCollection } from "@/app/lib/profiles/transaction.collection";
import { WalletTokenDTO } from "./wallet-token.dto";
import { BigNumber } from "@/app/lib/helpers";
import { ProfileSetting } from "./profile.enum.contract";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";

export class TokenService {
	#profile: Contracts.IProfile;
	#network: Networks.Network;
	#dustBalanceThreshold = "0.01";
	#walletTokensCollection: WalletTokenCollection;

	public constructor({ profile, network }: { profile: Contracts.IProfile; network: Networks.Network }) {
		this.#profile = profile;
		this.#network = network;
		this.#walletTokensCollection = new WalletTokenCollection([], {
			last: undefined,
			next: 0,
			prev: undefined,
			self: undefined,
			totalCount: undefined,
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
		return this.selected().totalCount();
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

		const hideDustTokens = this.#profile.settings().get(ProfileSetting.HideDustTokens);

		try {
			let tokensQuery: WalletTokensQuery = {
				addresses: this.#profile
					.wallets()
					.selected()
					.map((wallet) => wallet.address()),
				minBalance: hideDustTokens ? this.#dustBalanceThreshold : "0",
			};

			const whitelistedContractAddresses = this.#profile.whitelistedContractAddresses();

			if (whitelistedContractAddresses.length > 0) {
				tokensQuery = {
					...tokensQuery,
					whitelist: whitelistedContractAddresses,
				};
			}

			const response = await clientService.tokenAddresses({
				...tokensQuery,
				...(query ?? {}),
			});

			this.#walletTokensCollection = new WalletTokenCollection(response.items(), response.getPagination());
		} catch {
			this.#walletTokensCollection = new WalletTokenCollection([], {
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
				totalCount: undefined,
			});
		}
	}

	#aggregateTokens(tokens: WalletToken[]): WalletToken[] {
		const aggregated = new Map<string, WalletToken>();
		for (const token of tokens) {
			const existing = aggregated.get(token.token().address());

			if (existing) {
				const updatedWithBalance = new WalletToken({
					network: this.#profile.activeNetwork(),
					profile: this.#profile,
					token: existing.token(),
					walletToken: new WalletTokenDTO({
						address: token.address(),
						balance: BigNumber.make(token.balanceRaw()).plus(existing.balanceRaw()).toString(),
						tokenAddress: token.token().address(),
					}),
				});

				aggregated.set(token.token().address(), updatedWithBalance);
				continue;
			}

			aggregated.set(token.token().address(), token);
		}
		return [...aggregated.values()];
	}

	selected(): WalletTokenCollection {
		return this.#walletTokensCollection;
	}

	aggregated(): WalletTokenCollection {
		return new WalletTokenCollection(this.#aggregateTokens(this.#walletTokensCollection.items()), {
			last: this.#walletTokensCollection.lastPage(),
			next: this.#walletTokensCollection.nextPage(),
			prev: this.#walletTokensCollection.previousPage(),
			self: undefined,
			totalCount: this.#walletTokensCollection.totalCount(),
		});
	}

	#getTransactionWallet(
		transaction: ConfirmedTransactionData,
		queryAddresses?: string[],
	): Contracts.IReadWriteWallet | undefined {
		const address = queryAddresses?.find((address) =>
			[
				transaction.to()?.toLowerCase(),
				transaction.from()?.toLowerCase(),
				transaction.token()?.to().toLowerCase(),
				transaction.token()?.from().toLowerCase(),
			].includes(address.toLowerCase()),
		);

		if (address) {
			return this.#profile
				.wallets()
				.values()
				.find((wallet) => wallet.address().toLowerCase() === address.toLowerCase());
		}
	}

	#setTransactionMetadata(transactions: ConfirmedTransactionDataCollection, queryAddresses?: string[]): void {
		for (const transaction of transactions.items()) {
			const wallet = this.#getTransactionWallet(transaction, queryAddresses);

			if (wallet) {
				transaction.setMeta("publicKey", wallet.publicKey());
				transaction.setMeta("address", wallet.address());
			}
		}
	}

	/**
	 * Retrieves token transfers
	 *
	 * @returns {ExtendedConfirmedTransactionDataCollection}
	 */
	async transfers(query?: TokenTransfersQuery): Promise<ExtendedConfirmedTransactionDataCollection> {
		const activeNetwork = this.#profile.activeNetwork();

		const clientService = new ClientService({
			config: activeNetwork.config(),
			profile: this.#profile,
		});

		let response: ConfirmedTransactionDataCollection;

		const transfersQuery = {
			from: this.#profile
				.wallets()
				.selected()
				.map((wallet) => wallet.address()),
			...(query ?? {}),
		};

		try {
			response = await clientService.tokenTransfers(transfersQuery);

			const queryAddresses = [...transfersQuery.from, ...(transfersQuery.to ?? [])].filter(
				(address) => !!address,
			);

			this.#setTransactionMetadata(response, queryAddresses);
		} catch {
			return new ExtendedConfirmedTransactionDataCollection([], {
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
				totalCount: undefined,
			});
		}

		const transfers = response.items().map((transfer) => {
			const wallet = this.#getTransactionWallet(
				transfer,
				this.#profile
					.wallets()
					.values()
					.map((wallet) => wallet.address()),
			);

			return new ExtendedConfirmedTransactionData(wallet!, transfer);
		});

		return new ExtendedConfirmedTransactionDataCollection(transfers, response.getPagination());
	}

	/**
	 * Calculates the total balance of all tokens from selected wallets.
	 *
	 * @returns {number}
	 */
	selectedTotalBalance(): BigNumber {
		let total = BigNumber.make(0);

		for (const wallet of this.#profile.wallets().selected().values()) {
			for (const token of wallet.tokens().values()) {
				total = total.plus(token.balance());
			}
		}

		return total;
	}
}
