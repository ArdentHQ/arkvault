import { IReadWriteWallet, IReadWriteWalletAttributes, IVoteRegistry, WalletData } from "./contracts.js";
import { AttributeBag } from "./helpers/attribute-bag.js";
import { ReadOnlyWallet } from "./read-only-wallet.js";
import { VoteRegistryItem } from "./vote-registry.contract.js";

export class VoteRegistry implements IVoteRegistry {
	readonly #wallet: IReadWriteWallet;
	readonly #attributes: AttributeBag<IReadWriteWalletAttributes>;

	public constructor(wallet: IReadWriteWallet, attributes: AttributeBag<IReadWriteWalletAttributes>) {
		this.#wallet = wallet;
		this.#attributes = attributes;
	}

	/** {@inheritDoc IVoteRegistry.current} */
	public current(): VoteRegistryItem[] {
		const votes: { id: string; amount: number }[] | undefined = this.#wallet
			.data()
			.get<{ id: string; amount: number }[]>(WalletData.Votes);

		if (votes === undefined) {
			throw new Error(
				"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
			);
		}

		return votes.map(({ amount, id }) => {
			const wallet = this.#wallet.validators().mapByIdentifier(this.#wallet, id);

			if (wallet) {
				return {
					amount,
					wallet,
				};
			}

			// Validator doesn't exist in validators list. Get it from wallet attributes.
			const votingAddress = this.#attributes.get("wallet.data.attributes.vote");

			if (votingAddress) {
				return {
					amount: 0,
					wallet: new ReadOnlyWallet({
						address: votingAddress,
						explorerLink: this.#wallet.explorerLink(),
						governanceIdentifier: "address",
						isLegacyValidator: false,
						isResignedValidator: false,
						isValidator: true,
					}),
				};
			}

			return {
				amount: 0,
				wallet: undefined,
			};
		});
	}

	/** {@inheritDoc IVoteRegistry.available} */
	public available(): number {
		const result: number | undefined = this.#wallet.data().get<number>(WalletData.VotesAvailable);

		if (result === undefined) {
			throw new Error(
				"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
			);
		}

		return result;
	}

	/** {@inheritDoc IVoteRegistry.used} */
	public used(): number {
		const result: number | undefined = this.#wallet.data().get<number>(WalletData.VotesUsed);

		if (result === undefined) {
			throw new Error(
				"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
			);
		}

		return result;
	}
}
