/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Contracts, Http, IoC, Services, Signatories } from "@ardenthq/sdk";
import { UUID } from "@ardenthq/sdk-cryptography";
import { BigNumber, uniq } from "@/app/lib/helpers";
import { DateTime } from "@ardenthq/sdk-intl";

import { BindingType } from "./coin.contract";
import { applyCryptoConfiguration } from "./config";
import { Interfaces } from "./crypto/index";
import { MultiSignatureSigner } from "./multi-signature.signer";
import { PendingMultiSignatureTransaction } from "./multi-signature.transaction";
import { Request } from "./request";

export class MultiSignatureService extends Services.AbstractMultiSignatureService {
	readonly #dataTransferObjectService!: Services.DataTransferObjectService;
	readonly #request: Request;
	readonly #multiSignatureSigner!: IoC.Factory<MultiSignatureSigner>;
	readonly #configCrypto!: { crypto: Interfaces.NetworkConfig; height: number };

	public constructor(container: IoC.IContainer) {
		super();

		this.#dataTransferObjectService = container.get(IoC.BindingType.DataTransferObjectService);
		this.#multiSignatureSigner = container.factory(MultiSignatureSigner);
		this.#configCrypto = {
			crypto: container.get(BindingType.Crypto),
			height: container.get(BindingType.Height),
		};

		this.#request = new Request(
			container.get(IoC.BindingType.ConfigRepository),
			container.get(IoC.BindingType.HttpClient),
			container.get(IoC.BindingType.NetworkHostSelector),
		);
	}

	/** @inheritdoc */
	public override async allWithPendingState(publicKey: string): Promise<Services.MultiSignatureTransaction[]> {
		return this.#fetchAll(publicKey, "pending");
	}

	/** @inheritdoc */
	public override async allWithReadyState(publicKey: string): Promise<Services.MultiSignatureTransaction[]> {
		return this.#fetchAll(publicKey, "ready");
	}

	/** @inheritdoc */
	public override async findById(id: string): Promise<Services.MultiSignatureTransaction> {
		return this.#normalizeTransaction(await this.#post("show", { id }));
	}

	/** @inheritdoc */
	public override async forgetById(id: string): Promise<void> {
		await this.#post("delete", { id });
	}

	/** @inheritdoc */
	public override async broadcast(
		transaction: Services.MultiSignatureTransaction,
	): Promise<Services.BroadcastResponse> {
		let multisigAsset = transaction.multiSignature;

		if (transaction.asset && transaction.asset.multiSignature) {
			multisigAsset = transaction.asset.multiSignature;
		}

		if (Array.isArray(transaction.signatures)) {
			transaction.signatures = uniq(transaction.signatures);
		}

		try {
			const { id } = await this.#post("store", {
				data: transaction,
				multisigAsset,
			});

			return {
				accepted: [id],
				errors: {},
				rejected: [],
			};
		} catch (error) {
			if (error instanceof Http.RequestException) {
				return {
					accepted: [],
					errors: {
						[transaction.id]: (error as any).response.json().message,
					},
					rejected: [transaction.id],
				};
			}

			throw error;
		}
	}

	/** @inheritdoc */
	public override isMultiSignatureReady(
		transaction: Contracts.SignedTransactionData,
		excludeFinal?: boolean,
	): boolean {
		applyCryptoConfiguration(this.#configCrypto);
		return new PendingMultiSignatureTransaction(transaction.data()).isMultiSignatureReady({ excludeFinal });
	}

	/** @inheritdoc */
	public override needsSignatures(transaction: Contracts.SignedTransactionData): boolean {
		applyCryptoConfiguration(this.#configCrypto);
		return new PendingMultiSignatureTransaction(transaction.data()).needsSignatures();
	}

	/** @inheritdoc */
	public override needsAllSignatures(transaction: Contracts.SignedTransactionData): boolean {
		applyCryptoConfiguration(this.#configCrypto);
		return new PendingMultiSignatureTransaction(transaction.data()).needsAllSignatures();
	}

	/** @inheritdoc */
	public override needsWalletSignature(transaction: Contracts.SignedTransactionData, publicKey: string): boolean {
		applyCryptoConfiguration(this.#configCrypto);
		return new PendingMultiSignatureTransaction(transaction.data()).needsWalletSignature(publicKey);
	}

	/** @inheritdoc */
	public override needsFinalSignature(transaction: Contracts.SignedTransactionData): boolean {
		applyCryptoConfiguration(this.#configCrypto);
		return new PendingMultiSignatureTransaction(transaction.data()).needsFinalSignature();
	}

	/** @inheritdoc */
	public override remainingSignatureCount(transaction: Contracts.SignedTransactionData): number {
		applyCryptoConfiguration(this.#configCrypto);
		return new PendingMultiSignatureTransaction(transaction.data()).remainingSignatureCount();
	}

	/** @inheritdoc */
	public override async addSignature(
		transaction: Contracts.RawTransactionData,
		signatory: Signatories.Signatory,
	): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);

		const transactionWithSignature = await this.#multiSignatureSigner().addSignature();

		return this.#dataTransferObjectService.signedTransaction(
			transactionWithSignature.id!,
			transactionWithSignature,
		);
	}

	async #post(method: string, parameters: any): Promise<Contracts.KeyValuePair> {
		const response = await this.#request.post(
			"/",
			{
				body: {
					id: UUID.random(),
					jsonrpc: "2.0",
					method,
					params: parameters,
				},
			},
			"musig",
		);

		return response.result;
	}

	/**
	 * @private
	 * @param {*} transaction
	 * @returns {Record<string, any>}
	 * @memberof MultiSignatureService
	 */
	#normalizeTransaction({ data, id, multisigAsset, timestampReceived }: any): Record<string, any> {
		const result = {
			...data,
			id,
			// This is the real ID, computed by the MuSig Server.
			multiSignature: multisigAsset,
			timestamp: DateTime.fromUnix(timestampReceived),
		};

		const bigNumbers = ["amount", "fee", "nonce"];
		for (const key of bigNumbers) {
			if (result[key]) {
				result[key] = BigNumber.make(result[key]);
			}
		}

		if (Array.isArray(result.signatures)) {
			result.signatures = uniq(result.signatures);
		}

		// Ensure multipayment amounts are big numbers.
		if (Array.isArray(result.asset?.payments)) {
			for (const payment of result.asset.payments) {
				payment.amount = BigNumber.make(payment.amount);
			}
		}

		return result;
	}

	/**
	 *
	 *
	 * @private
	 * @param {string} publicKey
	 * @param {string} state
	 * @returns {Promise<any[]>}
	 * @memberof MultiSignatureService
	 */
	async #fetchAll(publicKey: string, state: string): Promise<any[]> {
		return (
			await this.#post("list", {
				publicKey,
				state,
			})
		).map((transaction) => this.#normalizeTransaction(transaction));
	}
}
