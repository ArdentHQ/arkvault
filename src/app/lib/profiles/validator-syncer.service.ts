import { Contracts, Services } from "@/app/lib/mainsail";

import { pqueueSettled } from "./helpers/queue.js";
import { ClientService } from "@/app/lib/mainsail/client.service.js";

export interface IValidatorSyncer {
	sync(query?: Contracts.KeyValuePair): Promise<Contracts.WalletData[]>;
}

export class ParallelValidatorSyncer implements IValidatorSyncer {
	readonly #clientService: ClientService;

	public constructor(clientService: ClientService) {
		this.#clientService = clientService;
	}

	async sync(query?: Contracts.KeyValuePair): Promise<Contracts.WalletData[]> {
		const result: Contracts.WalletData[] = [];
		const lastResponse = await this.#clientService.validators(query);
		for (const item of lastResponse.items()) {
			result.push(item);
		}

		const currentPage: number = Number.parseInt(lastResponse.currentPage()! as string);
		const lastPage: number = Number.parseInt(lastResponse.lastPage()! as string);

		if (lastPage > currentPage) {
			const promises: (() => Promise<void>)[] = [];

			const sendRequest = async (index: number) => {
				const response = await this.#clientService.validators({ cursor: index });

				for (const item of response.items()) {
					result.push(item);
				}
			};

			// Skip the first page and start from page 2 up to the last page.
			for (let index = currentPage + 1; index <= lastPage; index++) {
				promises.push(() => sendRequest(index));
			}

			await pqueueSettled(promises);
		}
		return result;
	}
}

export class SerialValidatorSyncer implements IValidatorSyncer {
	readonly #client: ClientService;

	public constructor(client: ClientService) {
		this.#client = client;
	}

	public async sync(query?: Contracts.KeyValuePair): Promise<Contracts.WalletData[]> {
		const result: Contracts.WalletData[] = [];

		const baseOptions: Services.ClientPagination = { ...(query ?? {}) };
		let options: Services.ClientPagination = { ...baseOptions };
		let lastResponse;

		do {
			lastResponse = await this.#client.validators(options);

			for (const item of lastResponse.items()) {
				result.push(item);
			}

			options = { ...baseOptions, cursor: lastResponse.nextPage() };
		} while (lastResponse.hasMorePages());

		return result;
	}
}
