import { ClientService } from "./client.service.js";
import type { ConfigRepository } from "@/app/lib/mainsail";
import type { IProfile } from "@/app/lib/profiles/profile.contract";

export class UnconfirmedTransactionsService {
	#config: ConfigRepository;
	#profile: IProfile;
	#client: ClientService;

	constructor({ config, profile }: { config: ConfigRepository; profile: IProfile }) {
		this.#config = config;
		this.#profile = profile;
		this.#client = new ClientService({ config: this.#config, profile: this.#profile });
	}

	async listUnconfirmed(parameters?: { page?: number; limit?: number; address?: string[] }) {
		const requestParams: Record<string, unknown> = {};

		if (parameters?.address && parameters.address.length > 0) {
			requestParams.address = parameters.address.join(",");
		}

		if (parameters?.page !== undefined) {
			requestParams.page = parameters.page;
		}

		const limit = parameters?.limit;

		const response = await this.#client.unconfirmedTransactions({
			limit,
			...requestParams,
		});

		const results = response.items() ?? [];
		return { results };
	}
}
