import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import { IDelegateService, IReadWriteWallet, IVoteRegistry, WalletData } from "./contracts.js";
import { VoteRegistryItem } from "./vote-registry.contract.js";

export class VoteRegistry implements IVoteRegistry {
	readonly #wallet: IReadWriteWallet;

	public constructor(wallet: IReadWriteWallet) {
		this.#wallet = wallet;
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

		return votes.map(({ amount, id }) => ({
			amount,
			wallet: container.get<IDelegateService>(Identifiers.DelegateService).mapByIdentifier(this.#wallet, id),
		}));
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
