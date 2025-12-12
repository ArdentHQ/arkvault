import { Contracts, Services } from "@/app/lib/mainsail";

import { IReadWriteWallet, IWalletSynchroniser, WalletData } from "./contracts.js";
import { WalletIdentifierFactory } from "./wallet.identifier.factory.js";
import { WalletToken } from "./wallet-token.js";

export class WalletSynchroniser implements IWalletSynchroniser {
	readonly #wallet: IReadWriteWallet;

	public constructor(wallet: IReadWriteWallet) {
		this.#wallet = wallet;
	}

	/** {@inheritDoc IWalletSynchroniser.identity} */
	public async identity(): Promise<void> {
		const currentWallet = this.#wallet.getAttributes().get<Contracts.WalletData>("wallet");
		const currentPublicKey = this.#wallet.data().get<string>(WalletData.PublicKey);

		const walletIdentifier: Services.WalletIdentifier = WalletIdentifierFactory.make(this.#wallet);

		try {
			const wallet: Contracts.WalletData = await this.#wallet.client().wallet(walletIdentifier);

			this.#wallet.getAttributes().set("wallet", wallet);

			if (!this.#wallet.network().usesExtendedPublicKey()) {
				this.#wallet.data().set(WalletData.PublicKey, wallet.publicKey());
			}

			this.#wallet.data().set(WalletData.Balance, wallet.balance());
			this.#wallet.data().set(WalletData.Sequence, wallet.nonce());
		} catch {
			/**
			 * TODO: decide what to do if the wallet couldn't be found
			 *
			 * A missing wallet could mean that the wallet is legitimate
			 * but has no transactions or that the address is wrong.
			 */

			this.#wallet.getAttributes().set("wallet", currentWallet);
			this.#wallet.data().set(WalletData.PublicKey, currentPublicKey);
		}

		this.#wallet.markAsFullyRestored();
	}

	/** {@inheritDoc IWalletSynchroniser.votes} */
	public async votes(): Promise<void> {
		const { available, votes, used } = await this.#wallet.client().votes(this.#wallet.address());

		this.#wallet.data().set(WalletData.VotesAvailable, available);
		this.#wallet.data().set(WalletData.Votes, votes);
		this.#wallet.data().set(WalletData.VotesUsed, used);
	}

	/** {@inheritDoc IWalletSynchroniser.tokens} */
	public async tokens(): Promise<void> {
		const walletTokens = await this.#wallet.client().walletTokens(this.#wallet.address());

		this.#wallet.tokens().flush();

		await Promise.allSettled(walletTokens.map(async (walletToken) => {
			try {
				const token = await this.#wallet.client().tokenByContractAddress(walletToken.tokenAddress())
				this.#wallet.tokens().create({ token, walletToken })
			} catch (error) {
				console.error(`[WalletSynchroniser#tokens] Failed to fetch token for address: ${walletToken.tokenAddress()}`, { error })
			}
		}));
	}
}
