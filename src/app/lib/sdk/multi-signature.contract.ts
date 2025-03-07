import { BroadcastResponse } from "./client.contract";
import { SignedTransactionData } from "./contracts";
import { Signatory } from "./signatories";

export type MultiSignatureTransaction = Record<string, any>;

export interface MultiSignatureAsset {
	publicKeys: string[];
	min: number;
}

/**
 * A service to manage, sign and broadcast all multi-signature transactions.
 *
 * @export
 * @interface MultiSignatureService
 */
export interface MultiSignatureService {
	/**
	 * Retrieve all multi-signature transactions that are awaiting for a signature from the given public key.
	 *
	 * @param {string} publicKey
	 * @returns {Promise<MultiSignatureTransaction[]>}
	 * @memberof MultiSignatureService
	 */
	allWithPendingState(publicKey: string): Promise<MultiSignatureTransaction[]>;

	/**
	 * Retrieve all multi-signature transactions that have been signed by all participants.
	 *
	 * @param {string} publicKey
	 * @returns {Promise<MultiSignatureTransaction[]>}
	 * @memberof MultiSignatureService
	 */
	allWithReadyState(publicKey: string): Promise<MultiSignatureTransaction[]>;

	/**
	 * Find a multi-signature transaction by its ID.
	 *
	 * @param {string} id
	 * @returns {Promise<MultiSignatureTransaction>}
	 * @memberof MultiSignatureService
	 */
	findById(id: string): Promise<MultiSignatureTransaction>;

	/**
	 * Find a multi-signature transaction by its ID and delete it.
	 *
	 * @param {string} id
	 * @returns {Promise<void>}
	 * @memberof MultiSignatureService
	 */
	forgetById(id: string): Promise<void>;

	/**
	 * Broadcast the given multi-signature transaction.
	 *
	 * @param {MultiSignatureTransaction} transaction
	 * @returns {Promise<BroadcastResponse>}
	 * @memberof MultiSignatureService
	 */
	broadcast(transaction: MultiSignatureTransaction): Promise<BroadcastResponse>;

	/**
	 * Determine if the multi-signature is ready to be broadcasting.
	 *
	 * @param {SignedTransactionData} transaction
	 * @param {boolean} [excludeFinal]
	 * @returns {boolean}
	 * @memberof MultiSignatureService
	 */
	isMultiSignatureReady(transaction: SignedTransactionData, excludeFinal?: boolean): boolean;

	/**
	 * Determine if the transaction is missing any signatures.
	 *
	 * @param {SignedTransactionData} transaction
	 * @returns {boolean}
	 * @memberof MultiSignatureService
	 */
	needsSignatures(transaction: SignedTransactionData): boolean;

	/**
	 * Determine if the transaction is missing all signatures.
	 *
	 * @param {SignedTransactionData} transaction
	 * @returns {boolean}
	 * @memberof MultiSignatureService
	 */
	needsAllSignatures(transaction: SignedTransactionData): boolean;

	/**
	 * Determine if the transaction is missing a signature from the given public key.
	 *
	 * @param {SignedTransactionData} transaction
	 * @param {string} publicKey
	 * @returns {boolean}
	 * @memberof MultiSignatureService
	 */
	needsWalletSignature(transaction: SignedTransactionData, publicKey: string): boolean;

	/**
	 * Determine if the transaction is missing its final signature.
	 *
	 * @param {SignedTransactionData} transaction
	 * @returns {boolean}
	 * @memberof MultiSignatureService
	 */
	needsFinalSignature(transaction: SignedTransactionData): boolean;

	/**
	 * Determine how many signatures are missing.
	 *
	 * @param {SignedTransactionData} transaction
	 * @returns {number}
	 * @memberof MultiSignatureService
	 */
	remainingSignatureCount(transaction: SignedTransactionData): number;

	/**
	 * Add a signature to a multi-signature or multi-signature registration transaction.
	 *
	 * @param {SignedTransactionData} transaction
	 * @param {Signatory} signatory
	 * @return {*}  {Promise<SignedTransactionData>}
	 * @memberof MultiSignatureService
	 */
	addSignature(transaction: SignedTransactionData, signatory: Signatory): Promise<SignedTransactionData>;
}
