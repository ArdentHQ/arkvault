/* istanbul ignore file */

import { Contracts, Services, Signatories } from "@ardenthq/sdk";

import { IReadWriteWallet, ITransactionService, WalletData } from "./contracts.js";
import { pqueueSettled } from "./helpers/queue.js";
import { ExtendedSignedTransactionData } from "./signed-transaction.dto.js";
import { SignedTransactionDataDictionary } from "./wallet-transaction.service.contract.js";

export class TransactionService implements ITransactionService {
	/**
	 * The wallet that all transactions are signed with.
	 *
	 * @memberof TransactionService
	 */
	readonly #wallet: IReadWriteWallet;

	/**
	 * The transactions that have been signed but not necessarily broadcasted.
	 *
	 * @memberof TransactionService
	 */
	#signed: SignedTransactionDataDictionary = {};

	/**
	 * The transactions that have been signed and broadcasted.
	 *
	 * @memberof TransactionService
	 */
	#broadcasted: SignedTransactionDataDictionary = {};

	/**
	 * The transactions that have been signed, broadcasted and confirmed.
	 *
	 * @memberof TransactionService
	 */
	#confirmed: SignedTransactionDataDictionary = {};

	/**
	 * The transactions that are waiting for any signatures.
	 *
	 * @memberof TransactionService
	 */
	#pending: SignedTransactionDataDictionary = {};

	public constructor(wallet: IReadWriteWallet) {
		this.#wallet = wallet;

		this.restore();
	}

	/** {@inheritDoc ITransactionService.sync} */
	public async sync(): Promise<void> {
		await pqueueSettled([() => this.#syncPendingMultiSignatures(), () => this.#syncReadyMultiSignatures()]);
	}

	/** {@inheritDoc ITransactionService.addSignature} */
	public async addSignature(id: string, signatory: Signatories.Signatory): Promise<Services.BroadcastResponse> {
		this.#assertHasValidIdentifier(id);

		let transaction: Services.MultiSignatureTransaction;

		try {
			transaction = await this.#wallet.coin().multiSignature().findById(id);
		} catch {
			// If we end up here we are adding the first signature, locally.
			transaction = this.transaction(id).data().data();
		}

		const transactionWithSignature = await this.#wallet
			.coin()
			.multiSignature()
			.addSignature(transaction as any, signatory);

		try {
			if (id !== transactionWithSignature.id()) {
				await this.#wallet.coin().multiSignature().forgetById(id);
			}
		} catch {
			//
		}

		const signedTransaction = this.#createExtendedSignedTransactionData(transactionWithSignature);
		return this.#wallet.coin().multiSignature().broadcast(signedTransaction.data().toSignedData());
	}

	/** {@inheritDoc ITransactionService.signTransfer} */
	public async signTransfer(input: Services.TransferInput): Promise<string> {
		return this.#signTransaction("transfer", input);
	}

	/** {@inheritDoc ITransactionService.signSecondSignature} */
	public async signSecondSignature(input: Services.SecondSignatureInput): Promise<string> {
		return this.#signTransaction("secondSignature", input);
	}

	/** {@inheritDoc ITransactionService.signUsernameRegistration} */
	public async signUsernameRegistration(input: Services.UsernameRegistrationInput): Promise<string> {
		return this.#signTransaction("usernameRegistration", input);
	}

	/** {@inheritDoc ITransactionService.signUsernameResignation} */
	public async signUsernameResignation(input: Services.UsernameResignationInput): Promise<string> {
		return this.#signTransaction("usernameResignation", input);
	}

	/** {@inheritDoc ITransactionService.signDelegateRegistration} */
	public async signDelegateRegistration(input: Services.DelegateRegistrationInput): Promise<string> {
		return this.#signTransaction("delegateRegistration", input);
	}

	/** {@inheritDoc ITransactionService.signValidatorRegistration} */
	public async signValidatorRegistration(input: Services.ValidatorRegistrationInput): Promise<string> {
		return this.#signTransaction("validatorRegistration", input);
	}

	/** {@inheritDoc ITransactionService.signVote} */
	public async signVote(input: Services.VoteInput): Promise<string> {
		return this.#signTransaction("vote", input);
	}

	/** {@inheritDoc ITransactionService.signMultiSignature} */
	public async signMultiSignature(input: Services.MultiSignatureInput): Promise<string> {
		return this.#signTransaction("multiSignature", input);
	}

	/** {@inheritDoc ITransactionService.signIpfs} */
	public async signIpfs(input: Services.IpfsInput): Promise<string> {
		return this.#signTransaction("ipfs", input);
	}

	/** {@inheritDoc ITransactionService.signMultiPayment} */
	public async signMultiPayment(input: Services.MultiPaymentInput): Promise<string> {
		return this.#signTransaction("multiPayment", input);
	}

	/** {@inheritDoc ITransactionService.signDelegateResignation} */
	public async signDelegateResignation(input: Services.DelegateResignationInput): Promise<string> {
		return this.#signTransaction("delegateResignation", input);
	}

	/** {@inheritDoc ITransactionService.signValidatorResignation} */
	public async signValidatorResignation(input: Services.ValidatorResignationInput): Promise<string> {
		return this.#signTransaction("validatorResignation", input);
	}

	/** {@inheritDoc ITransactionService.signUnlockToken} */
	public async signUnlockToken(input: Services.UnlockTokenInput): Promise<string> {
		return this.#signTransaction("unlockToken", input);
	}

	/** {@inheritDoc ITransactionService.transaction} */
	public transaction(id: string): ExtendedSignedTransactionData {
		this.#assertHasValidIdentifier(id);

		const transaction = this.#confirmed[id] || this.#broadcasted[id] || this.#signed[id] || this.#pending[id];

		if (!transaction) {
			throw new Error(`Transaction [${id}] could not be found.`);
		}

		return transaction;
	}

	/** {@inheritDoc ITransactionService.pending} */
	public pending(): SignedTransactionDataDictionary {
		return {
			...this.signed(),
			...this.broadcasted(),
			...this.#pending,
		};
	}

	/** {@inheritDoc ITransactionService.signed} */
	public signed(): SignedTransactionDataDictionary {
		return this.#signed;
	}

	/** {@inheritDoc ITransactionService.broadcasted} */
	public broadcasted(): SignedTransactionDataDictionary {
		return this.#broadcasted;
	}

	/** {@inheritDoc ITransactionService.waitingForOurSignature} */
	public waitingForOurSignature(): SignedTransactionDataDictionary {
		const transactions: SignedTransactionDataDictionary = {};

		for (const [id, transaction] of Object.entries(this.#pending)) {
			if (this.isAwaitingOurSignature(id)) {
				transactions[id] = transaction;
			}
		}

		return transactions;
	}

	/** {@inheritDoc ITransactionService.waitingForOtherSignatures} */
	public waitingForOtherSignatures(): SignedTransactionDataDictionary {
		const transactions: SignedTransactionDataDictionary = {};

		for (const [id, transaction] of Object.entries(this.#pending)) {
			if (this.isAwaitingOtherSignatures(id)) {
				transactions[id] = transaction;
			}
		}

		return transactions;
	}

	/** {@inheritDoc ITransactionService.hasBeenSigned} */
	public hasBeenSigned(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		return this.#signed[id] !== undefined;
	}

	/** {@inheritDoc ITransactionService.hasBeenBroadcasted} */
	public hasBeenBroadcasted(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		return this.#broadcasted[id] !== undefined;
	}

	/** {@inheritDoc ITransactionService.hasBeenConfirmed} */
	public hasBeenConfirmed(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		return this.#confirmed[id] !== undefined;
	}

	/** {@inheritDoc ITransactionService.isAwaitingConfirmation} */
	public isAwaitingConfirmation(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		return this.#broadcasted[id] !== undefined;
	}

	/** {@inheritDoc ITransactionService.isAwaitingOurSignature} */
	public isAwaitingOurSignature(id: string): boolean {
		return this.isAwaitingSignatureByPublicKey(id, this.#wallet.publicKey() as string);
	}

	/** {@inheritDoc ITransactionService.isAwaitingOtherSignatures} */
	public isAwaitingOtherSignatures(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		// It's coin's responsibility to distinguish min required signatures
		// based on registration & transaction type.
		const remainingSignatureCount = this.#wallet
			.coin()
			.multiSignature()
			.remainingSignatureCount(this.transaction(id).data());

		if (this.isAwaitingOurSignature(id)) {
			return remainingSignatureCount > 1;
		}

		return remainingSignatureCount > 0;
	}

	/** {@inheritDoc ITransactionService.isAwaitingSignatureByPublicKey} */
	public isAwaitingSignatureByPublicKey(id: string, publicKey: string): boolean {
		this.#assertHasValidIdentifier(id);

		return this.#wallet.coin().multiSignature().needsWalletSignature(this.transaction(id).data(), publicKey);
	}

	/** {@inheritDoc ITransactionService.isAwaitingFinalSignature} */
	public isAwaitingFinalSignature(id: string): boolean {
		return this.#wallet.coin().multiSignature().needsFinalSignature(this.transaction(id).data());
	}

	/** {@inheritDoc ITransactionService.canBeSigned} */
	public canBeSigned(id: string): boolean {
		if (this.isAwaitingSignatureByPublicKey(id, this.#getPublicKey())) {
			return true;
		}

		if (this.isAwaitingFinalSignature(id) && !this.isAwaitingOtherSignatures(id)) {
			return this.transaction(id).data().get("senderPublicKey") === this.#getPublicKey();
		}

		return false;
	}

	/** {@inheritDoc ITransactionService.canBeBroadcasted} */
	public canBeBroadcasted(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		if (!this.#signed[id]) {
			return false;
		}

		if (this.#signed[id].usesMultiSignature() && this.isAwaitingFinalSignature(id)) {
			return false;
		}

		return true;
	}

	/** {@inheritDoc ITransactionService.broadcast} */
	public async broadcast(id: string): Promise<Services.BroadcastResponse> {
		this.#assertHasValidIdentifier(id);

		const transaction: ExtendedSignedTransactionData = this.transaction(id);

		let result: Services.BroadcastResponse = {
			accepted: [],
			errors: {},
			rejected: [],
		};

		if (this.canBeBroadcasted(id)) {
			result = await this.#wallet.client().broadcast([transaction.data()]);
		} else if (transaction.isMultiSignatureRegistration() || transaction.usesMultiSignature()) {
			result = await this.#wallet.coin().multiSignature().broadcast(transaction.data().toSignedData());
		}

		if (result.accepted.includes(transaction.id())) {
			this.#broadcasted[id] = this.#signed[id];
		}

		return result;
	}

	/** {@inheritDoc ITransactionService.confirm} */
	public async confirm(id: string): Promise<boolean> {
		this.#assertHasValidIdentifier(id);

		if (!this.isAwaitingConfirmation(id)) {
			throw new Error(`Transaction [${id}] is not awaiting confirmation.`);
		}

		try {
			const transactionLocal: ExtendedSignedTransactionData = this.transaction(id);
			const transaction: Contracts.ConfirmedTransactionData = await this.#wallet
				.client()
				.transaction(transactionLocal.id());

			if (transaction.isConfirmed()) {
				delete this.#signed[id];
				delete this.#broadcasted[id];
				delete this.#pending[id];

				if (transactionLocal.isMultiSignatureRegistration() || transactionLocal.usesMultiSignature()) {
					try {
						await this.#wallet.coin().multiSignature().forgetById(id);
					} catch {
						//
					}
				}

				// We store the transaction here to be able to access it after it
				// has been confirmed. This list won't be persisted which means
				// it will be gone after a reboot of the consumer application.
				this.#confirmed[id] = transactionLocal;
			}

			return transaction.isConfirmed();
		} catch {
			return false;
		}
	}

	/** {@inheritDoc ITransactionService.fromPublicKey} */
	public dump(): void {
		const dumpStorage = (storage: object, storageKey: string) => {
			const result: Record<string, object> = {};

			for (const [id, transaction] of Object.entries(storage)) {
				this.#assertHasValidIdentifier(id);

				result[id] = transaction;
			}

			this.#wallet.data().set(storageKey, result);
		};

		dumpStorage(this.#signed, WalletData.SignedTransactions);
		dumpStorage(this.#broadcasted, WalletData.BroadcastedTransactions);
		dumpStorage(this.#pending, WalletData.PendingMultiSignatures);
	}

	/** {@inheritDoc ITransactionService.fromPublicKey} */
	public restore(): void {
		const restoreStorage = (storage: object, storageKey: string) => {
			const transactions: object = this.#wallet.data().get(storageKey) || {};

			for (const [id, transaction] of Object.entries(transactions)) {
				this.#assertHasValidIdentifier(id);

				storage[id] = new ExtendedSignedTransactionData(
					this.#wallet.dataTransferObject().signedTransaction(id, transaction),
					this.#wallet,
				);
			}
		};

		restoreStorage(this.#signed, WalletData.SignedTransactions);
		restoreStorage(this.#broadcasted, WalletData.BroadcastedTransactions);
		restoreStorage(this.#pending, WalletData.PendingMultiSignatures);
	}

	/**
	 * Sign a transaction of the given type.
	 *
	 * @private
	 * @param {string} type
	 * @param {*} input
	 * @returns {Promise<string>}
	 * @memberof TransactionService
	 */
	async #signTransaction(type: string, input: any): Promise<string> {
		const transaction: ExtendedSignedTransactionData = this.#createExtendedSignedTransactionData(
			await this.#wallet.coin().transaction()[type](input),
		);

		// When we are working with Multi-Signatures we need to sign them in split through
		// broadcasting and fetching them multiple times until all participants have signed
		// the transaction. Once the transaction is fully signed we can mark it as finished.
		if (transaction.isMultiSignatureRegistration() || transaction.usesMultiSignature()) {
			this.#pending[transaction.id()] = transaction;
		} else {
			this.#signed[transaction.id()] = transaction;
		}

		return transaction.id();
	}

	/**
	 * Ensure that the given ID is defined to avoid faulty data access.
	 *
	 * @private
	 * @param {string} id
	 * @memberof TransactionService
	 */
	#assertHasValidIdentifier(id: string): void {
		if (id === undefined) {
			throw new Error("Encountered a malformed ID. This looks like a bug.");
		}
	}

	/**
	 * Get the public key of the current wallet.
	 *
	 * @private
	 * @param {string} id
	 * @memberof TransactionService
	 */
	#getPublicKey(): string {
		const publicKey: string | undefined = this.#wallet.publicKey();

		/* istanbul ignore next */
		if (publicKey === undefined) {
			throw new Error(
				"This wallet is lacking a public key. Please sync the wallet before interacting with transactions.",
			);
		}

		return publicKey;
	}

	async #syncPendingMultiSignatures(): Promise<void> {
		const transactions = await this.#wallet
			.coin()
			.multiSignature()
			.allWithPendingState(this.#getPublicKey());

		this.#pending = {};

		for (const transaction of transactions) {
			const signedTransactionData = this.#wallet
				.coin()
				.dataTransferObject()
				.signedTransaction(transaction.id, transaction);
			await signedTransactionData.sanitizeSignatures();
			this.#pending[transaction.id] = this.#createExtendedSignedTransactionData(signedTransactionData);
		}
	}

	async #syncReadyMultiSignatures(): Promise<void> {
		const transactions = await this.#wallet
			.coin()
			.multiSignature()
			.allWithReadyState(this.#getPublicKey());

		this.#signed = {};

		for (const transaction of transactions) {
			const signedTransactionData = this.#wallet
				.coin()
				.dataTransferObject()
				.signedTransaction(transaction.id, transaction);
			await signedTransactionData.sanitizeSignatures();

			this.#signed[transaction.id] = this.#createExtendedSignedTransactionData(signedTransactionData);
		}
	}

	#createExtendedSignedTransactionData(transaction: Contracts.SignedTransactionData): ExtendedSignedTransactionData {
		return new ExtendedSignedTransactionData(transaction, this.#wallet);
	}
}
