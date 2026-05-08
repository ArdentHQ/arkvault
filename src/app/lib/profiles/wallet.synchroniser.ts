import { Contracts, Services } from "@/app/lib/mainsail";

import { IReadWriteWallet, IWalletSynchroniser, WalletData } from "./contracts.js";
import { WalletIdentifierFactory } from "./wallet.identifier.factory.js";

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

			this.#wallet.data().set(WalletData.TokenCount, wallet.tokenCount());
			this.#wallet.data().set(WalletData.Balance, wallet.balance());
			this.#wallet.data().set(WalletData.Sequence, wallet.nonce());
		} catch (error) {
			this.#wallet.getAttributes().set("wallet", currentWallet);
			this.#wallet.data().set(WalletData.PublicKey, currentPublicKey);

			if (error.message.includes("404")) {
				console.log(error);
				await this.legacyIdentity();
			}
		}

		this.#wallet.markAsFullyRestored();
	}

	private async legacyIdentity(): Promise<void> {
		const legacyAddress = this.#wallet.legacyAddress();
		console.log(legacyAddress);
		if (legacyAddress) {
			await this.#wallet.client().legacyColdWallet(legacyAddress);
		}
	}

	/** {@inheritDoc IWalletSynchroniser.votes} */
	public async votes(): Promise<void> {
		const { available, votes, used } = await this.#wallet.client().votes(this.#wallet.address());

		this.#wallet.data().set(WalletData.VotesAvailable, available);
		this.#wallet.data().set(WalletData.Votes, votes);
		this.#wallet.data().set(WalletData.VotesUsed, used);
	}
}
