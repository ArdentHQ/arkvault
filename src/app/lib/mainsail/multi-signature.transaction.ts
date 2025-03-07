import { MultiSignatureTransaction } from "./multi-signature.contract.js";

export class PendingMultiSignatureTransaction {
	readonly #transaction: MultiSignatureTransaction;

	public constructor(transaction: MultiSignatureTransaction) {
		this.#transaction = {
			...transaction,
			signatures: [...transaction.signatures!],
		};
	}

	public isMultiSignature(): boolean {
		return "multiSignature" in this.#transaction;
	}

	public isMultiSignatureRegistration(): boolean {
		return this.#transaction.type === 4;
	}

	public isMultiSignatureReady({ excludeFinal }: { excludeFinal?: boolean }): boolean {
		if (this.needsSignatures()) {
			return false;
		}

		if (!excludeFinal && this.isMultiSignatureRegistration() && this.needsFinalSignature()) {
			return false;
		}

		return true;
	}

	public needsSignatures(): boolean {
		if (!this.isMultiSignature()) {
			return false;
		}

		if (this.isMultiSignatureRegistration()) {
			return this.needsAllSignatures();
		}

		return this.#getValidMultiSignatures().length < this.#transaction.multiSignature.min;
	}

	public needsAllSignatures(): boolean {
		return this.#getValidMultiSignatures().length < this.#transaction.multiSignature.publicKeys.length;
	}

	public needsWalletSignature(publicKey: string): boolean {
		const transaction: MultiSignatureTransaction = this.#transaction;

		if (!this.needsSignatures() && !this.needsFinalSignature()) {
			return false;
		}

		if (this.isMultiSignatureRegistration() && this.isMultiSignatureReady({ excludeFinal: true })) {
			return transaction.senderPublicKey === publicKey && this.needsFinalSignature();
		}

		if (!this.isMultiSignature()) {
			return false;
		}

		const index: number = transaction.multiSignature.publicKeys.indexOf(publicKey);

		if (index === -1) {
			return false;
		}

		if (!transaction.signatures) {
			return true;
		}

		const signature: string | undefined = transaction.signatures.find(
			(signature) => parseInt(signature.substring(0, 2), 16) === index,
		);

		if (!signature) {
			return true;
		}

		return !this.#getValidMultiSignatures().includes(signature);
	}

	public needsFinalSignature(): boolean {
		if (this.isMultiSignature() && !this.isMultiSignatureRegistration()) {
			return false;
		}

		return !this.#transaction.signature;
	}

	public remainingSignatureCount(): number {
		const transaction: MultiSignatureTransaction = this.#transaction;

		let min: number = transaction.multiSignature.min;

		if (this.isMultiSignatureRegistration()) {
			min = transaction.multiSignature.publicKeys.length;
		}

		return min - transaction.signatures!.length;
	}

	#getValidMultiSignatures(): string[] {
		if (!this.isMultiSignature()) {
			return [];
		}

		return this.#transaction.signatures ?? [];
	}
}
