import { Contracts } from "@ardenthq/sdk";

import { IMultiSignature, IReadOnlyWallet, IReadWriteWallet, WalletData } from "./contracts.js";
import { ReadOnlyWallet } from "./read-only-wallet.js";

export class MultiSignature implements IMultiSignature {
	readonly #wallet: IReadWriteWallet;

	public constructor(wallet: IReadWriteWallet) {
		this.#wallet = wallet;
	}

	/** {@inheritDoc IMultiSignature.all} */
	public all(): Contracts.WalletMultiSignature {
		if (!this.#wallet.getAttributes().get<Contracts.WalletData>("wallet")) {
			throw new Error(
				"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
			);
		}

		return this.#wallet.getAttributes().get<Contracts.WalletData>("wallet").multiSignature();
	}

	/** {@inheritDoc IMultiSignature.participants} */
	public participants(): IReadOnlyWallet[] {
		const participants: Record<string, any> | undefined = this.#wallet
			.data()
			.get(WalletData.MultiSignatureParticipants);

		if (!participants) {
			throw new Error(
				"This Multi-Signature has not been synchronized yet. Please call [synchroniser().multiSignature()] before using it.",
			);
		}

		return this.publicKeys().map((publicKey: string) => new ReadOnlyWallet(participants[publicKey]));
	}

	/** {@inheritDoc IMultiSignature.publicKeys} */
	public publicKeys(): string[] {
		const { publicKeys, mandatoryKeys, optionalKeys } = this.all();

		return [...(publicKeys || []), ...(mandatoryKeys || []), ...(optionalKeys || [])];
	}
}
