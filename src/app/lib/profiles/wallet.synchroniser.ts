import { Contracts, Services } from "@/app/lib/mainsail";

import { IReadWriteWallet, IWalletSynchroniser, WalletData } from "./contracts.js";
import { WalletIdentifierFactory } from "./wallet.identifier.factory.js";
import { WalletData as WalletDataDto } from "@/app/lib/mainsail/wallet.dto";

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
			this.#wallet.data().set(WalletData.PublicKey, currentPublicKey);

			let isLegacyColdWallet = false;

			if (error.message.includes("404")) {
				const legacyWalletData = await this.legacyIdentity();
				if (legacyWalletData) {
					isLegacyColdWallet = true;

					this.#wallet.getAttributes().set("wallet", legacyWalletData);
					this.#wallet.data().set(WalletData.Balance, legacyWalletData.balance());
					this.#wallet.data().set(WalletData.IsLegacyColdWallet, true);
				}
			}

			if (!isLegacyColdWallet) {
				this.#wallet.getAttributes().set("wallet", currentWallet);
			}
		}

		this.#wallet.markAsFullyRestored();
	}

	private async legacyIdentity(): Promise<WalletDataDto | undefined> {
		const legacyAddress = this.#wallet.legacyAddress();
		if (!legacyAddress) {
			return;
		}

		try {
			const data = await this.#wallet.client().legacyColdWallet(legacyAddress);

			return new WalletDataDto({ config: this.#wallet.profile().activeNetwork().config() }).fill({
				address: this.#wallet.address(),
				attributes: {
					isLegacy: true,
					...data.attributes,
				},
				balance: data.balance,
				nonce: "0",
				publicKey: this.#wallet.publicKey(),
				updated_at: "0",
			});
		} catch {
			// ignore error
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
