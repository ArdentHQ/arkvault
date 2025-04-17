import {
	ExchangeTransactionDetail,
	ExchangeTransactionStatus,
	IExchangeTransaction,
	IExchangeTransactionData,
	IProfile,
} from "./contracts.js";

export class ExchangeTransaction implements IExchangeTransaction {
	readonly #profile: IProfile;
	readonly #id: string;
	readonly #orderId: string;
	readonly #provider: string;
	readonly #createdAt: number;
	#input: ExchangeTransactionDetail;
	#output: ExchangeTransactionDetail;
	#status: ExchangeTransactionStatus;

	public constructor(
		{
			id,
			orderId,
			input,
			output,
			provider,
			createdAt = Date.now(),
			status = ExchangeTransactionStatus.New,
		}: IExchangeTransactionData,
		profile: IProfile,
	) {
		this.#profile = profile;
		this.#id = id;
		this.#orderId = orderId;
		this.#provider = provider;
		this.#input = input;
		this.#output = output;
		this.#status = status;
		this.#createdAt = createdAt;
	}

	/** {@inheritDoc IExchangeTransaction.id} */
	public id(): string {
		return this.#id;
	}

	/** {@inheritDoc IExchangeTransaction.orderId} */
	public orderId(): string {
		return this.#orderId;
	}

	/** {@inheritDoc IExchangeTransaction.provider */
	public provider(): string {
		return this.#provider;
	}

	/** {@inheritDoc IExchangeTransaction.input */
	public input(): ExchangeTransactionDetail {
		return this.#input;
	}

	/** {@inheritDoc IExchangeTransaction.setInput */
	public setInput(input: ExchangeTransactionDetail): void {
		this.#input = input;
	}

	/** {@inheritDoc IExchangeTransaction.output */
	public output(): ExchangeTransactionDetail {
		return this.#output;
	}

	/** {@inheritDoc IExchangeTransaction.setOutput */
	public setOutput(output: ExchangeTransactionDetail): void {
		this.#output = output;
	}

	/** {@inheritDoc IExchangeTransaction.status} */
	public status(): ExchangeTransactionStatus {
		return this.#status;
	}

	/** {@inheritDoc IExchangeTransaction.isExpired} */
	public isExpired(): boolean {
		return this.status() === ExchangeTransactionStatus.Expired;
	}

	/** {@inheritDoc IExchangeTransaction.isFailed} */
	public isFailed(): boolean {
		return this.status() === ExchangeTransactionStatus.Failed;
	}

	/** {@inheritDoc IExchangeTransaction.isFinished} */
	public isFinished(): boolean {
		return this.status() === ExchangeTransactionStatus.Finished;
	}

	/** {@inheritDoc IExchangeTransaction.isPending} */
	public isPending(): boolean {
		return this.status() < ExchangeTransactionStatus.Finished;
	}

	/** {@inheritDoc IExchangeTransaction.isRefunded} */
	public isRefunded(): boolean {
		return this.status() === ExchangeTransactionStatus.Refunded;
	}

	/** {@inheritDoc IExchangeTransaction.setStatus} */
	public setStatus(status: ExchangeTransactionStatus): void {
		this.#status = status;
	}

	/** {@inheritDoc IExchangeTransaction.createdAt} */
	public createdAt(): number {
		return this.#createdAt;
	}

	/** {@inheritDoc IExchangeTransaction.toObject} */
	public toObject(): IExchangeTransactionData {
		return {
			createdAt: this.createdAt(),
			id: this.id(),
			input: this.input(),
			orderId: this.orderId(),
			output: this.output(),
			provider: this.provider(),
			status: this.status(),
		};
	}
}
