/* istanbul ignore file */

import { Exceptions, Services } from "@/app/lib/mainsail";
import { IReadWriteWallet, ITransactionService, WalletData } from "./contracts";

import { ExtendedSignedTransactionData } from "./signed-transaction.dto";
import { SignedTransactionDataDictionary } from "./wallet-transaction.service.contract";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";

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
	public sync(): Promise<void> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.sync.name);
	}

	/** {@inheritDoc ITransactionService.addSignature} */
	public addSignature(): Promise<Services.BroadcastResponse> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.addSignature.name);
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
	public async signDelegateRegistration(input: Services.ValidatorRegistrationInput): Promise<string> {
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

	/** {@inheritDoc ITransactionService.signMultiPayment} */
	public async signMultiPayment(input: Services.MultiPaymentInput): Promise<string> {
		return this.#signTransaction("multiPayment", input);
	}

	/** {@inheritDoc ITransactionService.signDelegateResignation} */
	public async signDelegateResignation(input: Services.ValidatorResignationInput): Promise<string> {
		return this.#signTransaction("delegateResignation", input);
	}

	/** {@inheritDoc ITransactionService.signValidatorResignation} */
	public async signValidatorResignation(input: Services.ValidatorResignationInput): Promise<string> {
		return this.#signTransaction("validatorResignation", input);
	}

	/** {@inheritDoc ITransactionService.signUpdateValidator} */
	public async signUpdateValidator(input: Services.UpdateValidatorInput): Promise<string> {
		return this.#signTransaction("updateValidator", input);
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
		return this.hasBeenBroadcasted(id);
	}

	/** {@inheritDoc ITransactionService.isAwaitingOurSignature} */
	public isAwaitingOurSignature(id: string): boolean {
		return this.isAwaitingSignatureByPublicKey(id);
	}

	/** {@inheritDoc ITransactionService.isAwaitingOtherSignatures} */
	public isAwaitingOtherSignatures(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		return false;
	}

	/** {@inheritDoc ITransactionService.isAwaitingSignatureByPublicKey} */
	public isAwaitingSignatureByPublicKey(id: string): boolean {
		return this.isAwaitingOtherSignatures(id);
	}

	/** {@inheritDoc ITransactionService.isAwaitingFinalSignature} */
	public isAwaitingFinalSignature(): boolean {
		return false;
	}

	/** {@inheritDoc ITransactionService.canBeSigned} */
	public canBeSigned(): boolean {
		return false;
	}

	/** {@inheritDoc ITransactionService.canBeBroadcasted} */
	public canBeBroadcasted(id: string): boolean {
		this.#assertHasValidIdentifier(id);

		if (!this.#signed[id]) {
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
		}

		if (result.accepted.includes(transaction.hash())) {
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
			const transaction: ConfirmedTransactionData = await this.#wallet
				.client()
				.transaction(transactionLocal.hash());

			if (transaction.isConfirmed()) {
				delete this.#signed[id];
				delete this.#broadcasted[id];
				delete this.#pending[id];

				// We store the transaction here to be able to access it after it
				// has been confirmed. This list won't be persisted which means
				// it will be gone after a reboot of the consumer application.
				this.#confirmed[id] = transactionLocal;
			}

			return transaction.isConfirmed();
		} catch (error) {
			console.log("error", error);
			return false;
		}
	}

	/** {@inheritDoc ITransactionService.fromPublicKey} */
	public dump(): void {
		// eslint-disable-next-line unicorn/consistent-function-scoping
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
		// eslint-disable-next-line unicorn/consistent-function-scoping
		const restoreStorage = (storage: object, storageKey: string) => {
			const transactions: object = this.#wallet.data().get(storageKey) || {};

			for (const [id, transaction] of Object.entries(transactions)) {
				this.#assertHasValidIdentifier(id);

				storage[id] = new ExtendedSignedTransactionData(
					// @TODO: Serialize transaction data within SignedTransactionData instead of requiring it as a property.
					new SignedTransactionData().configure(transaction, "1"),
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
			await this.#wallet.transactionService()[type](input),
		);

		// When we are working with Multi-Signatures we need to sign them in split through
		// broadcasting and fetching them multiple times until all participants have signed
		// the transaction. Once the transaction is fully signed we can mark it as finished.
		if (transaction.isMultiSignatureRegistration()) {
			this.#pending[transaction.hash()] = transaction;
		} else {
			this.#signed[transaction.hash()] = transaction;
		}

		return transaction.hash();
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

	#createExtendedSignedTransactionData(transaction: SignedTransactionData): ExtendedSignedTransactionData {
		return new ExtendedSignedTransactionData(transaction, this.#wallet);
	}
}
