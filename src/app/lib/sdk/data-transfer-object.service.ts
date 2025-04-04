/* istanbul ignore file */

import { get } from "@/app/lib/helpers";

import { MetaPagination } from "./client.contract";
import { ConfigKey, ConfigRepository } from "./coins";
import { ConfirmedTransactionDataCollection } from "./collections";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto.contract";
import { IContainer } from "./container.contracts";
import { WalletData } from "./contracts";
import { DataTransferObjectService } from "./data-transfer-object.contract";
import * as DataTransferObjects from "./dto";
import { Container } from "./ioc";
import { BindingType } from "./service-provider.contract";
import { SignedTransactionData } from "./signed-transaction.dto.contract";

export class AbstractDataTransferObjectService implements DataTransferObjectService {
	// @TODO: rework so that the container is not needed, this is a weird setup
	readonly #container: Container;
	readonly #configRepository: ConfigRepository;
	readonly #dataTransferObjects: Record<string, any>;

	public constructor(container: IContainer) {
		this.#container = container.get(BindingType.Container);
		this.#configRepository = container.get(BindingType.ConfigRepository);
		this.#dataTransferObjects = container.get(BindingType.DataTransferObjects);
	}

	public signedTransaction(identifier: string, signedData: string, broadcastData?: any): SignedTransactionData {
		return this.#container
			.resolve<SignedTransactionData>(this.#dataTransferObjects.SignedTransactionData)
			.configure(
				identifier,
				signedData,
				broadcastData,
				this.#configRepository.get<number>(ConfigKey.CurrencyDecimals),
			);
	}

	public transaction(transaction: unknown): ConfirmedTransactionData {
		return this.#resolveTransactionClass("ConfirmedTransactionData", transaction);
	}

	public transactions(transactions: unknown[], meta: MetaPagination): ConfirmedTransactionDataCollection {
		return new ConfirmedTransactionDataCollection(
			transactions.map((transaction) => this.transaction(transaction)),
			meta,
		);
	}

	public wallet(wallet: unknown): WalletData {
		return this.#container.resolve<WalletData>(this.#dataTransferObjects.WalletData).fill(wallet);
	}

	#resolveTransactionClass(klass: string, transaction: unknown): ConfirmedTransactionData {
		return this.#container
			.resolve<ConfirmedTransactionData>(
				(get(this.#dataTransferObjects, klass) || get(DataTransferObjects, klass))!,
			)
			.configure(transaction)
			.withDecimals(this.#configRepository.get(ConfigKey.CurrencyDecimals));
	}
}
