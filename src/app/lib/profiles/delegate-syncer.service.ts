import { Contracts, Services } from "@ardenthq/sdk";

import { pqueueSettled } from "./helpers/queue.js";

export interface IDelegateSyncer {
	sync(): Promise<Contracts.WalletData[]>;
}

export class ParallelDelegateSyncer implements IDelegateSyncer {
	readonly #clientService: Services.ClientService;

	public constructor(clientService: Services.ClientService) {
		this.#clientService = clientService;
	}

	async sync(): Promise<Contracts.WalletData[]> {
		const result: Contracts.WalletData[] = [];
		const lastResponse = await this.#clientService.delegates();
		for (const item of lastResponse.items()) {
			result.push(item);
		}

		const currentPage: number = Number.parseInt(lastResponse.currentPage()! as string);
		const lastPage: number = Number.parseInt(lastResponse.lastPage()! as string);

		if (lastPage > currentPage) {
			const promises: (() => Promise<void>)[] = [];

			const sendRequest = async (index: number) => {
				const response = await this.#clientService.delegates({ cursor: index });

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

export class SerialDelegateSyncer implements IDelegateSyncer {
	readonly #client: Services.ClientService;

	public constructor(client: Services.ClientService) {
		this.#client = client;
	}

	public async sync(): Promise<Contracts.WalletData[]> {
		const result: Contracts.WalletData[] = [];
		let options: Services.ClientPagination = {};

		let lastResponse;
		do {
			lastResponse = await this.#client.delegates(options);
			for (const item of lastResponse.items()) {
				result.push(item);
			}
			options = { cursor: lastResponse.nextPage() };
		} while (lastResponse.hasMorePages());
		return result;
	}
}
